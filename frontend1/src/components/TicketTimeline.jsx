// Ticket Progress Timeline Component
export default function TicketTimeline({ status }) {
  const steps = [
    { key: "SUBMITTED", label: "Ticket Submitted" },
    { key: "REVIEW", label: "Under Review" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" }
  ];

  // Map status to progress index
  const getActiveIndex = () => {
    switch (status) {
      case "OPEN":
        return 1;
      case "IN_PROGRESS":
        return 2;
      case "RESOLVED":
      case "CLOSED":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getActiveIndex();

  return (
    <div className="timeline-track" aria-label="Ticket progress timeline">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const nodeClass = isCompleted
          ? "timeline-step-node completed"
          : isActive
          ? "timeline-step-node active"
          : "timeline-step-node";

        return (
          <div key={step.key} className={nodeClass}>
            <div className="step-circle">
              {isCompleted ? "✓" : idx + 1}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
