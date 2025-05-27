// File: src/app/dashboard/page.tsx

'use client';

import { AuthGuard } from '@/components/guards/AuthGuard';
import { useAuth, useAuthHelpers } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { LogOut, User, Settings, BarChart3, FileText, Users } from 'lucide-react';

function DashboardContent() {
  const { logout } = useAuth();
  const { user, getUserDisplayName, getRoleDisplayName } = useAuthHelpers();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                NextCRM
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName()}
                </p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || 'User'}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your contracts and business today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">€2.4M</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Counterparties</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Contracts
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage and track all your business contracts in one place.
            </p>
            <Button variant="outline" className="w-full">
              View Contracts
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Contacts
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your counterparties and their contact information.
            </p>
            <Button variant="outline" className="w-full">
              View Contacts
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Analytics
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              View detailed reports and analytics for your business.
            </p>
            <Button variant="outline" className="w-full">
              View Reports
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No recent activity to display. Start by creating your first contract!
                </p>
                <Button className="mt-4">
                  Create Contract
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}