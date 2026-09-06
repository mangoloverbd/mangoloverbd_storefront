import { useEffect } from "react";

const PAGE_TITLE = "অর্ডারের জন্য ধন্যবাদ | ম্যাংগো লাভার";

export default function SundarbansHoneyThankYouPage() {
  useEffect(() => {
    const previousTitle = document.title;
    let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previousRobotsContent = robots?.getAttribute("content") ?? null;

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    document.title = PAGE_TITLE;
    robots.content = "noindex, nofollow";

    return () => {
      document.title = previousTitle;
      if (previousRobotsContent === null) {
        robots.remove();
      } else {
        robots.content = previousRobotsContent;
      }
    };
  }, []);

  return (
    <main className="min-h-screen" aria-labelledby="sundarbans-honey-thank-you-title">
      <h1 id="sundarbans-honey-thank-you-title" className="sr-only">
        অর্ডারের জন্য ধন্যবাদ
      </h1>
    </main>
  );
}
