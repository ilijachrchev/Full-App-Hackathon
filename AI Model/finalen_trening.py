import json
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from tab_transformer_pytorch import TabTransformer
from ortools.linear_solver import pywraplp
from sklearn.preprocessing import LabelEncoder

pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)

# Configuration
BERTHS = ['A', 'B', 'C', 'D']
BERTH_CAPACITY = 150
TIME_SLOT = 0.1
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 1e-3

COMPATIBILITY = {
    'A': ['Tanker'],
    'B': ['Container'],
    'C': ['Bulk'],
    'D': ['RoRo']
}

CATEGORICAL_COLUMNS = ['vessel_type', 'berth_type', 'container_subtype']
CONTINUOUS_COLUMNS = ['vessel_size', 'adjusted_eta_hour', 'planned_departure_hour', 'weather_score']

BERTH_ID_MAP = {'A': 0, 'B': 1, 'C': 2, 'D': 3}

class VesselDataset(Dataset):
    def __init__(self, df, encoders):
        self.df = df
        self.encoders = encoders
        self.categ_data = self.encode_categorical(df)

        for col in CONTINUOUS_COLUMNS:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
        self.df = self.df.dropna(subset=CONTINUOUS_COLUMNS)

        self.cont_data = torch.tensor(self.df[CONTINUOUS_COLUMNS].values, dtype=torch.float32)
        self.targets = torch.tensor(self.df['berth_id'].values, dtype=torch.long)

    def encode_categorical(self, df):
        cat_tensors = []
        for col in CATEGORICAL_COLUMNS:
            le = self.encoders[col]
            vals = df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0).values
            cat_tensors.append(torch.tensor(vals, dtype=torch.long))
        return torch.stack(cat_tensors, dim=1)

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        return self.categ_data[idx], self.cont_data[idx], self.targets[idx]

def prepare_encoders(df):
    encoders = {}
    for col in CATEGORICAL_COLUMNS:
        le = LabelEncoder()
        le.fit(df[col].astype(str))
        encoders[col] = le
    return encoders

def encode_categorical_columns(df, encoders):
    for col in CATEGORICAL_COLUMNS:
        le = encoders[col]
        df[col] = df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
    return df

class TabTransformerModel(nn.Module):
    def __init__(self, categories, num_continuous, num_classes):
        super().__init__()
        self.model = TabTransformer(
            categories=categories,
            num_continuous=num_continuous,
            dim=32,
            dim_out=num_classes,
            depth=6,
            heads=8,
            attn_dropout=0.1,
            ff_dropout=0.1,
        )

    def forward(self, x_categ, x_cont):
        return self.model(x_categ, x_cont)

def berth_to_int(berth):
    return BERTH_ID_MAP.get(berth, -1)

def int_to_berth(i):
    for k, v in BERTH_ID_MAP.items():
        if v == i:
            return k
    return None

def delay_from_weather(weather_score):
    delay_map = {0: 0.0, 1: 0.25, 2: 0.5, 3: 1.0, 4: 1.5, 5: 2.0}
    return delay_map.get(weather_score, 0.0)

def dtb_from_weather(weather_score):
    dtb_map = {0: 0.25, 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.25, 5: 1.5}
    return dtb_map.get(weather_score, 0.25)

def load_and_preprocess_dataset_from_json(json_data, current_time):
    df = pd.DataFrame(json_data)

    df['eta_hour'] = pd.to_numeric(df['eta_hour'], errors='coerce')
    df['planned_departure_hour'] = pd.to_numeric(df['planned_departure_hour'], errors='coerce')
    df['weather_score'] = pd.to_numeric(df['weather_score'], errors='coerce').fillna(0).astype(int)

    df = df.dropna(subset=['eta_hour', 'planned_departure_hour'])

    df['eta_hour'] = df['eta_hour'].apply(lambda x: max(x, current_time))

    df['vessel_type'] = df['vessel_type'].fillna('Container')
    df['berth_type'] = df['berth_type'].fillna('Container')
    df['container_subtype'] = df['container_subtype'].fillna('None')

    df['vessel_type_name'] = df['vessel_type']
    df['adjusted_eta_hour'] = df.apply(lambda r: r['eta_hour'] + delay_from_weather(r['weather_score']), axis=1)
    df['dtb'] = df['weather_score'].apply(dtb_from_weather)

    if 'berth_id' in df.columns:
        df['berth_id'] = df['berth_id'].map(lambda x: berth_to_int(x) if x in BERTH_ID_MAP else -1)

    return df

def train_tabtransformer(model, dataset, epochs=EPOCHS):
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    criterion = nn.CrossEntropyLoss()
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for x_categ, x_cont, y in dataloader:
            optimizer.zero_grad()
            preds = model(x_categ, x_cont)
            loss = criterion(preds.squeeze(), y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(dataloader):.4f}")

def predict_tabtransformer(model, df, encoders):
    model.eval()
    for col in CATEGORICAL_COLUMNS:
        le = encoders[col]
        df[col] = df[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else 0)
    x_categ = torch.tensor(df[CATEGORICAL_COLUMNS].values, dtype=torch.long)
    x_cont = torch.tensor(df[CONTINUOUS_COLUMNS].values, dtype=torch.float32)
    with torch.no_grad():
        logits = model(x_categ, x_cont)
        preds = torch.argmax(logits, dim=1).cpu().numpy()
    df['predicted_berth_id'] = preds
    df['predicted_berth'] = df['predicted_berth_id'].map(int_to_berth)
    return df

def vessel_priority(size):
    if size == 75:
        return 1
    elif size == 50:
        return 2
    else:
        return 3

def milp_schedule_max_vessels_per_berth(vessels_df, berth_id, current_time,
                                        berth_capacity=BERTH_CAPACITY, time_slot=TIME_SLOT):
    vessels = vessels_df.copy()
    n = len(vessels)
    if n == 0:
        return pd.DataFrame()

    # Debug: Print input to solver
    print(f"Input to solver for berth {berth_id}:")
    print(vessels[['vessel_type_name', 'vessel_size', 'adjusted_eta_hour', 'planned_departure_hour', 'dtb']])

    earliest_start = current_time
    latest_end = current_time + 72  # 72-hour horizon

    time_points = [earliest_start + t * time_slot for t in range(int((latest_end - earliest_start) / time_slot) + 1)]
    T = len(time_points)

    solver = pywraplp.Solver.CreateSolver('CBC')
    if not solver:
        print(f"Solver not found for berth {berth_id}")
        return None

    # Set solver parameters for determinism
    solver.SetNumThreads(1)  # Disable parallel processing
    solver.SetSolverSpecificParametersAsString("random_seed=42")  # Set random seed
    solver.SetSolverSpecificParametersAsString("primal_tolerance=1e-8")  # Tighten tolerance
    solver.SetSolverSpecificParametersAsString("dual_tolerance=1e-8")

    M = 1e6  # Large constant for big-M constraints
    waiting_penalty = 0.1  # Further reduced
    simultaneous_bonus = 5e5  # Increased to strongly favor simultaneous berthing

    # Decision variables
    x = {i: solver.BoolVar(f'x_{i}') for i in range(n)}  # Vessel i is scheduled
    s = {i: solver.NumVar(earliest_start, latest_end, f'start_{i}') for i in range(n)}  # Start time for vessel i
    y = {(i, t): solver.BoolVar(f'y_{i}_{t}') for i in range(n) for t in range(T)}  # Vessel i is berthed at time t
    z = {(t): solver.IntVar(0, n, f'z_{t}') for t in range(T)}  # Number of vessels berthed at time t

    # Objective: Maximize scheduled vessels and simultaneous berthing, minimize waiting time
    solver.Maximize(
        solver.Sum([x[i] for i in range(n)]) * 1e6 +
        solver.Sum([z[t] * simultaneous_bonus for t in range(T)]) -
        waiting_penalty * solver.Sum([s[i] - vessels.iloc[i]['adjusted_eta_hour'] for i in range(n)])
    )

    # Start time constraints: Enforce start at adjusted_eta_hour
    for i in range(n):
        eta = vessels.iloc[i]['adjusted_eta_hour']
        solver.Add(s[i] == eta * x[i] + M * (1 - x[i]))  # Start at ETA if scheduled

    # Link y[i,t] with s[i] and duration
    for i in range(n):
        duration = (vessels.iloc[i]['planned_departure_hour'] - vessels.iloc[i]['adjusted_eta_hour']) + vessels.iloc[i]['dtb'] * 2
        for t in range(T):
            time_t = time_points[t]
            solver.Add(s[i] <= time_t + M * (1 - y[i, t]))
            solver.Add(s[i] + duration >= time_t + time_slot - M * (1 - y[i, t]))
        solver.Add(solver.Sum([y[i, t] for t in range(T)]) == x[i] * int(np.ceil(duration / time_slot)))

    # Berth capacity constraint
    for t in range(T):
        solver.Add(solver.Sum([vessels.iloc[i]['vessel_size'] * y[i, t] for i in range(n)]) <= berth_capacity)

    # Count simultaneous vessels
    for t in range(T):
        solver.Add(z[t] == solver.Sum([y[i, t] for i in range(n)]))

    # No priority constraints for this case (both vessels are 50m)

    # Solve
    status = solver.Solve()

    if status != pywraplp.Solver.OPTIMAL:
        print(f"Solver status for berth {berth_id}: {status}. No optimal solution found.")
        return None

    # Debug: Print objective components
    total_vessels = sum(x[i].solution_value() for i in range(n))
    simultaneous_score = sum(z[t].solution_value() * simultaneous_bonus for t in range(T))
    waiting_score = sum((s[i].solution_value() - vessels.iloc[i]['adjusted_eta_hour']) * waiting_penalty for i in range(n))
    print(f"Objective breakdown for berth {berth_id}:")
    print(f"  Total vessels: {total_vessels} * 1e6 = {total_vessels * 1e6}")
    print(f"  Simultaneous score: {simultaneous_score}")
    print(f"  Waiting penalty: {waiting_score}")

    # Collect assignments
    assignments = []
    for i in range(n):
        if x[i].solution_value() > 0.5:
            start_time = s[i].solution_value()
            duration = (vessels.iloc[i]['planned_departure_hour'] - vessels.iloc[i]['adjusted_eta_hour']) + vessels.iloc[i]['dtb'] * 2
            scheduled_end = start_time + duration
            waiting_time = max(0, start_time - vessels.iloc[i]['adjusted_eta_hour'])
            original_idx = vessels.index[i]
            assignments.append({
                'vessel_index': original_idx,
                'assigned_berth': berth_id,
                'scheduled_start': round(start_time, 2),
                'scheduled_end': round(scheduled_end, 2),
                'waiting_time': round(waiting_time, 2),
                'vessel_type': vessels_df.loc[original_idx, 'vessel_type_name'],
                'vessel_size': vessels_df.loc[original_idx, 'vessel_size'],
                'planned_departure_hour': round(vessels_df.loc[original_idx, 'planned_departure_hour'], 2),
                'adjusted_eta_hour': round(vessels_df.loc[original_idx, 'adjusted_eta_hour'], 2),
                'dtb': round(vessels_df.loc[original_idx, 'dtb'], 2)
            })

    # Debug: Log simultaneous berthing
    schedule_df = pd.DataFrame(assignments)
    if not schedule_df.empty:
        for t in time_points:
            vessels_at_t = schedule_df[
                (schedule_df['scheduled_start'] <= t) & (t < schedule_df['scheduled_end'])
            ]
            if len(vessels_at_t) > 1:
                total_size = vessels_at_t['vessel_size'].sum()
                print(f"Berth {berth_id} at time {t:.2f}: {len(vessels_at_t)} vessels, total size {total_size}m")

    return schedule_df

def schedule_all_berths_separately(vessels_df, current_time):
    schedules = []
    print(f"Total vessels before scheduling: {len(vessels_df)}")
    for berth in BERTHS:
        compatible_vessels = vessels_df[vessels_df['vessel_type_name'].isin(COMPATIBILITY[berth])]
        print(f"Berth {berth} compatible vessels: {len(compatible_vessels)}")
        if compatible_vessels.empty:
            continue
        schedule = milp_schedule_max_vessels_per_berth(compatible_vessels, berth, current_time)
        if schedule is not None and not schedule.empty:
            schedules.append(schedule)
    if schedules:
        combined_schedule = pd.concat(schedules).reset_index(drop=True)
        print(f"Total vessels scheduled: {len(combined_schedule)}")
        return combined_schedule
    else:
        print("No vessels scheduled.")
        return pd.DataFrame()

def assign_realtime_status(schedule_df, current_time):
    def status(row):
        if row['scheduled_end'] <= current_time:
            return 'LEFT'
        elif row['scheduled_start'] <= current_time < row['scheduled_end']:
            return 'Currently berthed'
        else:
            return 'WAITING'
    schedule_df['realtime_status'] = schedule_df.apply(status, axis=1)
    return schedule_df

def assign_unscheduled_vessels(all_vessels_df, scheduled_df, current_time):
    scheduled_indices = set(scheduled_df['vessel_index'])
    unscheduled = all_vessels_df.loc[~all_vessels_df.index.isin(scheduled_indices)].copy()
    if unscheduled.empty:
        return scheduled_df

    max_end = scheduled_df['scheduled_end'].max() if not scheduled_df.empty else current_time
    buffer = 1.0
    unscheduled['scheduled_start'] = max_end + buffer
    unscheduled['scheduled_end'] = unscheduled['scheduled_start'] + (
        unscheduled['planned_departure_hour'] - unscheduled['adjusted_eta_hour']
    ) + unscheduled['dtb'] * 2
    unscheduled['waiting_time'] = unscheduled['scheduled_start'] - unscheduled['adjusted_eta_hour']
    unscheduled['assigned_berth'] = unscheduled['vessel_type_name'].map({
        'Container': 'B',
        'Tanker': 'A',
        'Bulk': 'C',
        'RoRo': 'D'
    })
    unscheduled['realtime_status'] = 'WAITING'

    metadata_cols = ['vessel_type_name', 'vessel_size', 'planned_departure_hour', 'adjusted_eta_hour', 'dtb']
    for col in metadata_cols:
        unscheduled[col] = all_vessels_df.loc[unscheduled.index, col]

    unscheduled = unscheduled.rename(columns={'vessel_type_name': 'vessel_type'})

    unscheduled = unscheduled.loc[:, ~unscheduled.columns.duplicated()]

    cols = list(dict.fromkeys(scheduled_df.columns))
    if 'vessel_index' not in unscheduled.columns:
        unscheduled = unscheduled.reset_index().rename(columns={'index': 'vessel_index'})

    unscheduled = unscheduled.loc[:, cols]

    scheduled_df = scheduled_df.reset_index(drop=True)

    combined = pd.concat([scheduled_df, unscheduled], ignore_index=True)
    return combined

def time_to_decimal_hours(time_str):
    hours, minutes = map(int, time_str.split(':'))
    return hours + minutes / 60

def main():
    fixed_time_str = "20:00"
    current_time = time_to_decimal_hours(fixed_time_str)
    print(f"Simulating scheduling at fixed time: {fixed_time_str} ({current_time:.2f} hours)")

    with open('master_vessels_dataset.json', 'r') as f:
        training_json = json.load(f)
    print("Loading and preprocessing training data...")
    df_train = load_and_preprocess_dataset_from_json(training_json, current_time)

    encoders = prepare_encoders(df_train)
    df_train = encode_categorical_columns(df_train, encoders)

    dataset = VesselDataset(df_train, encoders)
    num_classes = len(BERTHS)
    categories = tuple(len(encoders[col].classes_) for col in CATEGORICAL_COLUMNS)
    model = TabTransformerModel(categories=categories, num_continuous=len(CONTINUOUS_COLUMNS), num_classes=num_classes)

    print("Training TabTransformer model...")
    train_tabtransformer(model, dataset)

    torch.save(model.state_dict(), 'tabtransformer_model.pth')

    with open('test_vessels_20.json', 'r') as f:
        new_vessels_json = json.load(f)
    print("Loading and preprocessing new vessels...")
    df_new = load_and_preprocess_dataset_from_json(new_vessels_json, current_time)
    df_new = encode_categorical_columns(df_new, encoders)

    print("Predicting berth assignments with TabTransformer...")
    predicted_df = predict_tabtransformer(model, df_new, encoders)

    print(f"Total vessels for scheduling: {len(predicted_df)}")

    print("Running berth-by-berth MILP scheduling...")
    optimized_schedule = schedule_all_berths_separately(predicted_df, current_time)

    if optimized_schedule.empty:
        print("No feasible schedule found.")
        return

    optimized_schedule = assign_realtime_status(optimized_schedule, current_time)
    optimized_schedule = assign_unscheduled_vessels(predicted_df, optimized_schedule, current_time)

    print("Optimized schedule:")
    print(optimized_schedule[['vessel_index', 'assigned_berth', 'scheduled_start', 'scheduled_end', 'waiting_time',
                              'vessel_type', 'vessel_size', 'planned_departure_hour', 'adjusted_eta_hour', 'dtb', 'realtime_status']])

    optimized_schedule.to_csv('optimized_berth_schedule_full.csv', index=False)
    print("Schedule saved to 'optimized_berth_schedule_full.csv'")

if __name__ == "__main__":
    main()