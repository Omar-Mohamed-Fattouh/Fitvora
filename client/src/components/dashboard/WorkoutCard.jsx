const WorkoutCard = ({ workout, onStart, labels = {} }) => (
  <article className={`item-card ${workout.completed ? "is-done" : ""}`}>
    <div className="card-head">
      <h3>{workout.title}</h3>
      <span className="dash-muted">{workout.scheduled}</span>
    </div>
    <p className="dash-muted">
      {typeof workout.duration === "number" ? `${workout.duration} ${labels.min || "min"}` : workout.duration}
      {" · "}
      {workout.calories} {labels.kcal || "kcal"}
    </p>
    {workout.completed ? (
      <p className="dash-muted">{labels.completed || "Done"}</p>
    ) : (
      <button type="button" className="text-btn" onClick={onStart}>
        {labels.start || "Log it"}
      </button>
    )}
  </article>
);

export default WorkoutCard;
