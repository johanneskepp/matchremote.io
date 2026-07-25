'use client'

import { ReactNode } from 'react'

export interface QuizCardProps {
  title: string
  description?: string
  type: 'radio' | 'checkbox' | 'range' | 'text' | 'select'
  options?: Array<{ value: string | number; label: string }>
  value?: any
  onChange: (value: any) => void
  min?: number
  max?: number
  step?: number
  children?: ReactNode
  required?: boolean
}

export function QuizCard({
  title,
  description,
  type,
  options = [],
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  children,
  required = false,
}: QuizCardProps) {
  return (
    <div className="card w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      {children ? (
        children
      ) : type === 'radio' ? (
        <div className="space-y-3">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
            >
              <input
                type="radio"
                name={title}
                value={option.value}
                checked={value === option.value}
                onChange={e => onChange(e.target.value)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      ) : type === 'checkbox' ? (
        <div className="space-y-3">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={(value || []).includes(option.value)}
                onChange={e => {
                  const newValue = e.target.checked
                    ? [...(value || []), option.value]
                    : (value || []).filter((v: any) => v !== option.value)
                  onChange(newValue)
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      ) : type === 'range' ? (
        <div className="space-y-4">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value || min}
            onChange={e => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">{min}</span>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{value || min}</span>
              {max && <span className="text-gray-600">/ {max}</span>}
            </div>
            <span className="font-medium text-gray-900">{max}</span>
          </div>
        </div>
      ) : type === 'select' ? (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="input-field"
        >
          <option value="">Select an option...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'text' ? (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter your answer..."
          className="input-field"
        />
      ) : null}
    </div>
  )
}
