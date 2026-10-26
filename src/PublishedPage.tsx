import { parseLayout, renderLayout } from "@hybridappdev/primitives";
import { formatError } from "./draft";
import { interpret } from "./questions";
import { loadPublished } from "./storage";

export function PublishedPage() {
  const parsed = parseLayout(loadPublished() ?? interpret(""));
  if (Array.isArray(parsed)) {
    return (
      <main className="screen">
        <div className="errors" role="alert">
          {parsed.map((error, index) => (
            <p key={`${index}-${error.message}`}>{formatError(error)}</p>
          ))}
        </div>
      </main>
    );
  }

  return <main className="screen">{renderLayout(parsed)}</main>;
}
