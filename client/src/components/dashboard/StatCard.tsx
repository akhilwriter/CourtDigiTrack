import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  changeText?: string;
  changeValue?: number;
  iconBgColor: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  icon,
  changeText,
  changeValue = 0,
  iconBgColor,
  iconColor
}: StatCardProps) {
  const isPositive = changeValue >= 0;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-600 text-sm">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          </div>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconBgColor)}>
            <div className={cn(iconColor)}>{icon}</div>
          </div>
        </div>
        {changeText && (
          <div className={cn(
            "mt-4 text-xs flex items-center",
            isPositive ? "text-success" : "text-error"
          )}>
            {isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            <span>{changeText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
