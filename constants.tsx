
import React from 'react';
import { Trophy, Users, Settings, Gamepad2, Gift, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
};

export const ICONS = {
  Classroom: <Users className="w-5 h-5" />,
  Setup: <Settings className="w-5 h-5" />,
  Play: <Gamepad2 className="w-5 h-5" />,
  Reward: <Gift className="w-5 h-5" />,
  Reset: <RotateCcw className="w-5 h-5" />,
  Success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  Failure: <XCircle className="w-5 h-5 text-red-500" />,
  Trophy: <Trophy className="w-8 h-8 text-yellow-500" />
};

export const ROWS = 3;
export const TABLES_PER_ROW = 5;
export const SEATS_PER_TABLE = 2;
