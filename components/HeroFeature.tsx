import { featured, featuredSecondary } from "@/lib/data";
import { ArticleCard } from "./ArticleCard";

export function HeroFeature() {
  return (
    <div className="hero-feat">
      <ArticleCard a={featured} />
      <div className="stack-col">
        {featuredSecondary.map((a) => (
          <ArticleCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
