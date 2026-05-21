/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Appointment } from '../../types';

export interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  dot?: boolean; // 显示左侧小圆点
}

export default function Badge({
  variant,
  size = 'md',
  children,
  dot = false
}: BadgeProps) {
  // Styles based on size prop
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  // Color mappings
  const colorMap = {
    default: {
      badge: 'bg-gray-100 text-gray-700',
      dotBg: 'bg-gray-400'
    },
    success: {
      badge: 'bg-green-100 text-green-700',
      dotBg: 'bg-green-500'
    },
    warning: {
      badge: 'bg-yellow-100 text-yellow-700',
      dotBg: 'bg-yellow-500'
    },
    danger: {
      badge: 'bg-red-100 text-red-700',
      dotBg: 'bg-red-500'
    },
    info: {
      badge: 'bg-blue-105 bg-blue-100 text-blue-700',
      dotBg: 'bg-blue-500'
    },
    gray: {
      badge: 'bg-gray-50 text-gray-500',
      dotBg: 'bg-gray-300'
    }
  };

  const currentTheme = colorMap[variant] || colorMap.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeStyles[size]} ${currentTheme.badge}`}
    >
      {/* Optional leading status indicator dot */}
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dotBg}`} />
      )}
      {children}
    </span>
  );
}

/**
 * 辅助函数：根据 AppointmentStatus 返回对应的 badge variant
 * 映射:
 * PENDING → warning
 * CONFIRMED → info
 * CHECKED_IN → info (blue)
 * IN_PROGRESS → warning
 * COMPLETED → success
 * CANCELLED → gray
 * NO_SHOW → danger
 */
export function getAppointmentStatusBadge(
  status: Appointment['status'] | 'NO_SHOW'
): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray' {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'CHECKED_IN':
      return 'info'; // Maps to blue
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'gray';
    case 'NO_SHOW':
      return 'danger';
    default:
      return 'default';
  }
}
