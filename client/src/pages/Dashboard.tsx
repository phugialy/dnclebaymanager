import React from 'react';
import { 
  TagIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Active Listings', value: '24', icon: TagIcon, change: '+12%', changeType: 'positive' },
    { name: 'Total Orders', value: '156', icon: ShoppingCartIcon, change: '+8%', changeType: 'positive' },
    { name: 'Revenue', value: '$12,450', icon: CurrencyDollarIcon, change: '+23%', changeType: 'positive' },
    { name: 'Conversion Rate', value: '3.2%', icon: ArrowTrendingUpIcon, change: '+0.5%', changeType: 'positive' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your eBay management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TagIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New listing created</p>
                <p className="text-sm text-gray-500">iPhone 13 Pro - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCartIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Order received</p>
                <p className="text-sm text-gray-500">Order #12345 - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Payment received</p>
                <p className="text-sm text-gray-500">$299.99 - 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 