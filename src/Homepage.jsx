import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ChevronDownIcon } from 'lucide-react';
import axios from 'axios';
import RecipeList from './components/RecipeList';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';

const filters = [
  "Dairy products", "Meat products", "Sweets and candy", "Bread and cereals",
  "Beef and veals", "Fish and seafood", "Milk, cheese and egs", "Oils and fats",
  "Fruit and berries", "Vegetables"
];

const Homepage = () => {
  const [selectedIngredients, setSelectedIngredients] = useState(Array(3).fill(''));
  const [chartData, setChartData] = useState(null);
  const [yaxis, setYaxis] = useState({ min: 0, max: 200 });
  const chartRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/price');

        // Modify naming of series to remove unnecessary prefix numbers
        const modifiedData = {
          ...response.data,
          series: response.data.series.map(item => ({
              ...item,
              name: item.name.split(' ').slice(1).join(" ")
          }))
        };

        // Get min and max values for Y axis
        const allValues = modifiedData.series.flatMap(series => series.data);
        const min = Math.min(...allValues) - 10;
        const max = Math.max(...allValues) + 10;

        setYaxis({ min: min, max: max});
        setChartData(modifiedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartData && typeof chartData !== 'undefined') {
      console.log(chartData);
      const chart = echarts.init(chartRef.current);
      const option = {
        title: {
          text: 'Food Price Dashboard',
          left: 'center',
          top: 0
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: chartData.series.map(item => item.name),
          top: 30,
          // left: 0,
          // orient: "vertical",
          // type: "scroll",  // Add scrolling for better legend handling
          padding: [5, 50], // Add padding
          height: 80  // Set specific height for legend area
        },
        grid: {
          top: 130,  // Increase top margin to accommodate legend
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.categories
        },
        yAxis: {
          type: 'value',
          min: yaxis.min,
          max: yaxis.max,
        },
        series: chartData.series.map(series => ({
          name: series.name,
          type: 'line',
          data: series.data.map(value => value === 0 ? '-' : value),
          connectNulls: true
        })),
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: 0,
            start: 0,
            end: 100
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            right: 10,
            start: 0,
            end: 100
          },
          {
            type: 'inside',
            yAxisIndex: 0,
            start: 0,
            end: 100
          }
        ]
      };
      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, [chartData]);

  const handleRangeChange = (e) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setTimeRange([min, max]);
    // Here you would update the chart data based on the new time range
  };

  const getDateFromPercentage = (percentage) => {
    const startDate = new Date(1970, 0, 1);
    const endDate = new Date(2024, 7, 1);
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const days = totalDays * (percentage / 100);
    const date = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleGenerateClick = () => {
    // Filter out empty strings and pass only selected ingredients
    const filteredIngredients = selectedIngredients.filter(ingredient => ingredient);
    navigate('/recipe-generator', { state: { includedIngredients: filteredIngredients } });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* <div className="bg-white shadow rounded-lg p-6 text-black flex flex-col justify-center items-center h-full">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div>
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input type="checkbox" id={`filter-${index}`} className="mr-2" defaultChecked />
                  <label htmlFor={`filter-${index}`}>{filter}</label>
                </div>
              ))}
            </div>
          </div> */}
          <div className="md:col-span-3 bg-white shadow rounded-lg p-6">
            <div ref={chartRef} style={{height: '400px'}} />
            {/* <div className="mt-4 flex justify-between items-center">
              <span>{getDateFromPercentage(timeRange[0])}</span>
              <input
                type="range"
                className="w-3/4"
                min="0"
                max="100"
                value={`${timeRange[0]},${timeRange[1]}`}
                onChange={handleRangeChange}
                multiple
              />
              <span>{getDateFromPercentage(timeRange[1])}</span>
            </div> */}
            {/* <div className="text-center text-sm text-gray-500 mt-2">Set Date Range</div> */}
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-black flex flex-col justify-center h-full">
            <h2 className="text-lg font-semibold mb-4">Recipe Generator</h2>
            <div className="grid grid-cols-1">
              {[1, 2, 3].map((num) => (
                <div key={num} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Include as ingredient #{num} for recipe
                  </label>
                  <div className="relative">
                    <select
                      value={selectedIngredients[num - 1]}
                      onChange={(e) => {
                        const newIngredients = [...selectedIngredients];
                        newIngredients[num - 1] = e.target.value;
                        setSelectedIngredients(newIngredients);
                      }}
                      className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-3 pr-8 leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Value</option>
                      {filters.map((filter, index) => (
                        <option key={index} value={filter}>{filter}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              onClick={handleGenerateClick}
            >
              Click to generate recipes
            </button>
          </div>
          
        </div>

        <RecipeList ingredients={selectedIngredients} />
        
      </main>
    </div>
  );
};

export default Homepage;
