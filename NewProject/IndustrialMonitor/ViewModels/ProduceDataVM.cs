using HybridApp.Core.Attributes;
using HybridApp.Core.ViewModels;
using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using System.IO;

namespace IndustrialMonitor.ViewModels
{
    public class ProduceData
    {
        public string FileName { get; set; } = string.Empty;
        public int Count { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public double TimeSpanMinute { get; set; }
    }

    public class DailyProduceStat
    {
        public string DateString { get; set; } = string.Empty;
        public int TotalCount { get; set; }
        public double AverageTimeSpan { get; set; }
    }

    [SyncViewModel("ProduceDataVM", Description = "生产数据统计及历史查询ViewModel")]
    public class ProduceDataVM : SyncViewModelBase
    {
        private readonly MachineVM _machineVM;

        public ProduceDataVM(MachineVM machineVM) : base("ProduceDataVM")
        {
            _machineVM = machineVM;
        }

        private SqliteConnection GetConnection()
        {
            string dbPath = string.IsNullOrWhiteSpace(_machineVM.SqliteDbPath) 
                            ? "IndustrialMonitor.db" 
                            : _machineVM.SqliteDbPath;
            return new SqliteConnection($"Data Source={dbPath}");
        }

        [SyncCommand(Description = "根据时间范围查询班次/详细的生产数据记录")]
        public List<ProduceData> QueryProduceData(DateTime startTime, DateTime endTime)
        {
            var result = new List<ProduceData>();
            try
            {
                using var conn = GetConnection();
                conn.Open();

                string sql = @"
                    SELECT FileName, Count, StartTime, EndTime, TimeSpanMinute 
                    FROM ProduceData 
                    WHERE StartTime >= @start AND StartTime <= @end
                    ORDER BY StartTime DESC";

                using var cmd = new SqliteCommand(sql, conn);
                cmd.Parameters.AddWithValue("@start", startTime.ToString("yyyy-MM-dd HH:mm:ss"));
                cmd.Parameters.AddWithValue("@end", endTime.ToString("yyyy-MM-dd HH:mm:ss"));

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    result.Add(new ProduceData
                    {
                        FileName = reader.IsDBNull(0) ? "" : reader.GetString(0),
                        Count = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
                        StartTime = reader.IsDBNull(2) ? DateTime.MinValue : reader.GetDateTime(2),
                        EndTime = reader.IsDBNull(3) ? DateTime.MinValue : reader.GetDateTime(3),
                        TimeSpanMinute = reader.IsDBNull(4) ? 0 : reader.GetDouble(4)
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProduceDataVM] QueryProduceData 失败: {ex.Message}");
            }

            return result;
        }

        [SyncCommand(Description = "查询指定时间范围内每天的加工数量统计，用于图表展示")]
        public List<DailyProduceStat> QueryDailyStatistics(DateTime startTime, DateTime endTime)
        {
            var result = new List<DailyProduceStat>();
            try
            {
                using var conn = GetConnection();
                conn.Open();

                // 按天分组统计
                string sql = @"
                    SELECT 
                        date(StartTime) as DateStr, 
                        SUM(Count) as TotalCount,
                        AVG(TimeSpanMinute) as AvgTime
                    FROM ProduceData 
                    WHERE StartTime >= @start AND StartTime <= @end
                    GROUP BY date(StartTime)
                    ORDER BY date(StartTime) ASC";

                using var cmd = new SqliteCommand(sql, conn);
                cmd.Parameters.AddWithValue("@start", startTime.ToString("yyyy-MM-dd HH:mm:ss"));
                cmd.Parameters.AddWithValue("@end", endTime.ToString("yyyy-MM-dd HH:mm:ss"));

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    result.Add(new DailyProduceStat
                    {
                        DateString = reader.IsDBNull(0) ? "" : reader.GetString(0),
                        TotalCount = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
                        AverageTimeSpan = reader.IsDBNull(2) ? 0 : reader.GetDouble(2)
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ProduceDataVM] QueryDailyStatistics 失败: {ex.Message}");
            }

            return result;
        }

        [SyncCommand(Description = "用于调试：初始化自动生成假数据避免表不存在")]
        public void MockInitDataIfTableNotExists()
        {
            try
            {
                using var conn = GetConnection();
                conn.Open();
                
                string createSql = @"
                    CREATE TABLE IF NOT EXISTS ProduceData (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        FileName TEXT,
                        Count INTEGER,
                        StartTime DATETIME,
                        EndTime DATETIME,
                        TimeSpanMinute REAL
                    )";
                using (var createCmd = new SqliteCommand(createSql, conn))
                {
                    createCmd.ExecuteNonQuery();
                }

                // 检查是否有数据
                using (var checkCmd = new SqliteCommand("SELECT COUNT(*) FROM ProduceData", conn))
                {
                    var count = Convert.ToInt32(checkCmd.ExecuteScalar());
                    if (count == 0)
                    {
                        // 插入14天的数据
                        var insertSql = "INSERT INTO ProduceData(FileName, Count, StartTime, EndTime, TimeSpanMinute) VALUES (@f, @c, @s, @e, @t)";
                        DateTime now = DateTime.Now;
                        var rand = new Random();
                        
                        for (int i = 14; i >= 0; i--)
                        {
                            for(int j = 0; j < 3; j++) 
                            {
                                using var cmd = new SqliteCommand(insertSql, conn);
                                DateTime st = now.AddDays(-i).AddHours(-10 + j * 3);
                                DateTime et = st.AddMinutes(rand.Next(30, 180));
                                cmd.Parameters.AddWithValue("@f", $"PART_{rand.Next(1000, 9999)}.NC");
                                cmd.Parameters.AddWithValue("@c", rand.Next(50, 200));
                                cmd.Parameters.AddWithValue("@s", st.ToString("yyyy-MM-dd HH:mm:ss"));
                                cmd.Parameters.AddWithValue("@e", et.ToString("yyyy-MM-dd HH:mm:ss"));
                                cmd.Parameters.AddWithValue("@t", (et - st).TotalMinutes);
                                cmd.ExecuteNonQuery();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                 Console.WriteLine($"MockInitData error: {ex.Message}");
            }
        }
    }
}
