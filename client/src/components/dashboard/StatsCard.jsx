const StatsCard = ({ stat }) => (
  <article className="rounded-2xl bg-slate-50 p-4">
    <div className="flex justify-between items-start gap-3">
      <div>
        <p className="text-slate-500 text-xs font-medium">{stat.title}</p>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          {stat.unit && <span className="ms-1 text-xs text-slate-500">{stat.unit}</span>}
        </div>
      </div>
      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">{stat.icon}</div>
    </div>
    {stat.change && <p className="mt-2 text-xs text-slate-500">{stat.change}</p>}
  </article>
);

export default StatsCard;
