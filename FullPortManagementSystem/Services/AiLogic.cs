using CsvHelper;
using FullPortManagementSystem.Models;
using System.Globalization;

namespace FullPortManagementSystem.Services
{
    public class AiLogic
    {
        public static List<AiSchedule> ParseAiCsv(string csvContent)
        {
            using var reader = new StringReader(csvContent);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            // If your CSV uses commas (,) and period decimals, the default is fine.
            // If your AI ever uses semicolons or other culture, adjust the config here.

            var records = csv.GetRecords<AiSchedule>().ToList();
            return records;
        }
    }
}
