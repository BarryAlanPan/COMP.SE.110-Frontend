import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ChevronDownIcon } from 'lucide-react';

const filters = [
  "Dairy products", "Meat products", "Sweets and candy", "Bread and cereals",
  "Beef and veals", "Fish and seafood", "Milk, cheese and egs", "Oils and fats",
  "Fruit and berries", "Vegetables"
];

const Homepage = () => {
  const [selectedIngredients, setSelectedIngredients] = useState(Array(3).fill(''));
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    const option = {
      title: {
        text: 'Food Price Dashboard',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Food Price Index', 'Meat Price Index', 'Dairy Price Index', 'Cereals Price Index', 'Oils Price Index', 'Sugar Price Index'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: ['1970', '1980', '1990', '2000', '2010', '2020', '2024']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        { name: 'Food Price Index', type: 'line', data: [100, 110, 105, 115, 150, 200, 230] },
        { name: 'Meat Price Index', type: 'line', data: [95, 105, 100, 110, 140, 180, 190] },
        { name: 'Dairy Price Index', type: 'line', data: [98, 108, 103, 113, 160, 220, 225] },
        { name: 'Cereals Price Index', type: 'line', data: [97, 107, 102, 112, 155, 210, 240] },
        { name: 'Oils Price Index', type: 'line', data: [96, 106, 101, 111, 145, 190, 210] },
        { name: 'Sugar Price Index', type: 'line', data: [99, 109, 104, 114, 170, 250, 280] }
      ],
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
        }
      ]
    };
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, []); // No dependencies needed now

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Recipe Finder</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-black flex flex-col justify-center items-center h-full">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div>
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input type="checkbox" id={`filter-${index}`} className="mr-2" defaultChecked />
                  <label htmlFor={`filter-${index}`}>{filter}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
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
            <div className="text-center text-sm text-gray-500 mt-2">Set Date Range</div>
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
            <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Click to generate recipes
            </button>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default Homepage;