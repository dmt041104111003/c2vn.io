"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      data-theme-toggle=""
      className="relative inline-flex h-9 w-16 items-center rounded-full border bg-background p-1 transition-colors hover:bg-accent/60 focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
    >
      <span className="pointer-events-none absolute left-1 text-muted-foreground">
        <Sun className="size-4" />
      </span>
      <span className="pointer-events-none absolute right-1 text-muted-foreground">
        <Moon className="size-4" />
      </span>

      <motion.span
        className="relative z-[1] size-7 rounded-full bg-primary text-primary-foreground shadow-xs flex items-center justify-center"
        animate={{ x: theme === "dark" ? 28 : 0, rotate: theme === "dark" ? 360 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {theme === "light" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </motion.span>
    </button>
  );
}
