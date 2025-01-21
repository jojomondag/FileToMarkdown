# codeCs.cs

```csharp
using System;
using System.Collections.Generic;

namespace WeatherApp
{
    public class WeatherForecast
    {
        public DateTime Date { get; set; }
        public double Temperature { get; set; }
        public string Description { get; set; }
        public int Humidity { get; set; }
    }

    public class WeatherService
    {
        private List<WeatherForecast> forecasts;

        public WeatherService()
        {
            forecasts = new List<WeatherForecast>();
        }

        public void AddForecast(DateTime date, double temperature, string description, int humidity)
        {
            var forecast = new WeatherForecast
            {
                Date = date,
                Temperature = temperature,
                Description = description,
                Humidity = humidity
            };
            forecasts.Add(forecast);
        }

        public WeatherForecast GetForecast(DateTime date)
        {
            return forecasts.Find(f => f.Date.Date == date.Date);
        }

        public List<WeatherForecast> GetWeeklyForecast(DateTime startDate)
        {
            return forecasts.FindAll(f => f.Date >= startDate && f.Date < startDate.AddDays(7));
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var weatherService = new WeatherService();

            // Add some sample forecasts
            weatherService.AddForecast(DateTime.Now, 25.5, "Sunny", 60);
            weatherService.AddForecast(DateTime.Now.AddDays(1), 22.0, "Partly Cloudy", 65);
            weatherService.AddForecast(DateTime.Now.AddDays(2), 18.5, "Rainy", 80);

            // Get today's forecast
            var todayForecast = weatherService.GetForecast(DateTime.Now);
            Console.WriteLine($"Today's weather: {todayForecast.Temperature}°C, {todayForecast.Description}");

            // Get weekly forecast
            var weeklyForecast = weatherService.GetWeeklyForecast(DateTime.Now);
            Console.WriteLine("\nWeekly Forecast:");
            foreach (var forecast in weeklyForecast)
            {
                Console.WriteLine($"{forecast.Date.ToShortDateString()}: {forecast.Temperature}°C, {forecast.Description}");
            }
        }
    }
} 
```