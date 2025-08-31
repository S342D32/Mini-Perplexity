import React from 'react';

interface CardProps {
  title: string;
  description: string;
  status?: 'active' | 'inactive';
}

const Card: React.FC<CardProps> = ({ title, description, status = 'active' }) => {
  return (
    <div className="p-4 rounded-lg shadow-md bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Card;