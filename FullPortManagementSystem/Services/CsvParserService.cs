using CsvHelper;
using FullPortManagementSystem.Models;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace FullPortManagementSystem.Services
{
    public static class CsvParserService
    {
        /// <summary>
        /// Parses your AI‐generated CSV into a List of AiSchedule.
        /// </summary>
        public static List<AiSchedule> ParseAiCsv(string csvContent)
        {
            using var reader = new StringReader(csvContent);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            // Make sure your AiSchedule class lives in Models/AiSchedule.cs
            return csv.GetRecords<AiSchedule>().ToList();
        }
    }
}
