import {
  Shirt, Droplets, Apple, Dumbbell, ChefHat, BookOpen,
  Moon, Heart, Home, Leaf,
} from "lucide-react";
import type { ReactNode } from "react";

const iconMap: Record<string, (size: number) => ReactNode> = {
  "בגדי בד איכותי":         (s) => <Shirt size={s} />,
  "מוצרי טיפוח טבעיים":    (s) => <Droplets size={s} />,
  "מזון בריא וסופרפוד":    (s) => <Apple size={s} />,
  "ספורט וכושר":            (s) => <Dumbbell size={s} />,
  "מתכונים בריאים":         (s) => <ChefHat size={s} />,
  "טיפים ומומחים":          (s) => <BookOpen size={s} />,
  "שינה וריקברי":           (s) => <Moon size={s} />,
  "בריאות האישה":           (s) => <Heart size={s} />,
  "בית ירוק וניקוי טבעי":  (s) => <Home size={s} />,
  // wellnessSites categories
  "ויטמינים ותוספים":       (s) => <Leaf size={s} />,
  "טיפוח טבעי":             (s) => <Droplets size={s} />,
  "אופנה בת קיימא":         (s) => <Shirt size={s} />,
  "מזון אורגני":            (s) => <Apple size={s} />,
  "בית ירוק":               (s) => <Home size={s} />,
};

export function getCategoryIcon(catName: string, size = 18): ReactNode {
  const fn = iconMap[catName];
  return fn ? fn(size) : <Leaf size={size} />;
}
