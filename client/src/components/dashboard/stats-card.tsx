import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  subValue,
  icon,
  iconBgColor,
  iconTextColor,
  trend
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
                  {trend ? (
                    <div className={cn(
                      "ml-2 flex items-baseline text-sm font-semibold",
                      trend.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d={trend.positive 
                            ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                            : "M19 14l-7 7m0 0l-7-7m7 7V3"
                          } 
                        />
                      </svg>
                      <span className="sr-only">{trend.positive ? "Increased by" : "Decreased by"}</span>
                      {trend.value}
                    </div>
                  ) : subValue ? (
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600 dark:text-gray-400">
                      <span>{subValue}</span>
                    </div>
                  ) : null}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
