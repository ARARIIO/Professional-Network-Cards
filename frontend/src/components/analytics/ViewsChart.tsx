import type { DayView } from '../../graphql/types';
import { weekdayShort } from '../../utils/format';

type Props = {
  data: DayView[];
};

export function ViewsChart({ data }: Props) {
  const max = data.reduce((acc, day) => (day.count > acc ? day.count : acc), 0);

  return (
    <>
      <div className="chart-head">
        <div className="chart-title">Просмотры за 7 дней</div>
        <div className="muted-xs">макс. {max} / день</div>
      </div>
      <div className="bars">
        {data.map((day) => {
          const pct = max === 0 ? 0 : Math.round((day.count / max) * 100);
          const isMax = max > 0 && day.count === max;
          return (
            <div className="bar-col" key={day.date}>
              <div
                className={isMax ? 'bar is-max' : 'bar'}
                style={{ height: `${pct}%` }}
              />
              <div className={isMax ? 'bar-label is-max' : 'bar-label'}>
                {weekdayShort(day.date)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
