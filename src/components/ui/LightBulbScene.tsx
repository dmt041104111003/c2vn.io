"use client";

import React, { useEffect, useRef } from "react";

function tween(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (v: number) => void,
  onDone?: () => void
) {
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const v = from + (to - from) * eased;
    onUpdate(v);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else if (onDone) {
      onDone();
    }
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export default function LightBulbScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const disposeRef = useRef<() => void>(() => {});

  useEffect(() => {
    let MatterLib: any;
    let engine: any;
    let ceiling: any;
    let bulb: any;
    let cord: any;
    let mouseConstraint: any;
    let frameRaf = 0;
    let brightness = 1;
    let lightOn = true;
    let destroyed = false;
    let cleanupTween: (() => void) | null = null;

    const setup = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();

      try {
        MatterLib = (await import("matter-js")).default ?? (await import("matter-js"));
      } catch (e) {
        const drawFallback = () => {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#e8e8e8";
          ctx.beginPath();
          ctx.arc(canvas.width - 60, 140, 20, 0, Math.PI * 2);
          ctx.fill();
          frameRaf = requestAnimationFrame(drawFallback);
        };
        frameRaf = requestAnimationFrame(drawFallback);
        disposeRef.current = () => cancelAnimationFrame(frameRaf);
        return;
      }

      const { Engine, Bodies, Constraint, World,  Body } = MatterLib;
      engine = Engine.create();
      engine.world.gravity.y = 0.8;

      const anchorX = () => (canvas.width - 60);
      ceiling = Bodies.rectangle(anchorX(), 40, 20, 10, { isStatic: true });
      bulb = Bodies.circle(anchorX(), canvas.height / 3, 22, {
        density: 0.006,
        frictionAir: 0.03,
        restitution: 0.2,
      });

      let baseLength = canvas.height / 2 - 62;
      cord = Constraint.create({ bodyA: ceiling, bodyB: bulb, length: baseLength, stiffness: 0.98, damping: 0.08 });
      Body.setPosition(bulb, { x: ceiling.position.x, y: ceiling.position.y + baseLength });
      Body.setInertia(bulb, Infinity);

      World.add(engine.world, [ceiling, bulb, cord]);


      const drawRealisticLighting = (x: number, y: number) => {
        if (!lightOn) {
          brightness += (0 - brightness) * 0.08;
          return;
        }
        brightness += (1 - brightness) * 0.08;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 560);
        gradient.addColorStop(0, `rgba(255, 240, 200, ${0.5 * brightness})`);
        gradient.addColorStop(0.4, `rgba(255, 220, 170, ${0.2 * brightness})`);
        gradient.addColorStop(1, "rgba(150, 120, 100, 0)");
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 560, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      };

      const drawBulb = (x: number, y: number) => {
        ctx.save();
        ctx.filter = "blur(0.6px)";
        ctx.globalAlpha = 0.95;

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ceiling.position.x, ceiling.position.y);
        ctx.lineTo(x, y - 28);
        ctx.stroke();

        ctx.fillStyle = "#9aa1a7";
        ctx.strokeStyle = "#7b8085";
        ctx.lineWidth = 1;
        const capWidth = 22;
        const capHeight = 10;
        ctx.beginPath();
        ctx.roundRect(x - capWidth / 2, y - 28, capWidth, capHeight, 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#858b92";
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(x - capWidth / 2 + 2, y - 26 + i * 2);
          ctx.lineTo(x + capWidth / 2 - 2, y - 26 + i * 2);
          ctx.stroke();
        }

        const r = 20;
        const grd = ctx.createRadialGradient(x - 6, y - 8, 2, x, y, r);
        grd.addColorStop(0, lightOn ? "rgba(255,255,255,0.95)" : "rgba(235,235,235,0.9)");
        grd.addColorStop(0.55, lightOn ? "rgba(255,250,230,0.7)" : "rgba(230,230,230,0.6)");
        grd.addColorStop(1, "rgba(200,200,200,0.25)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(180,180,180,0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.strokeStyle = "#b8b8b8";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 6);
        ctx.lineTo(x - 2, y - 2);
        ctx.lineTo(x + 2, y - 2);
        ctx.lineTo(x + 6, y - 6);
        ctx.stroke();

        ctx.save();
        if (lightOn) {
          ctx.shadowColor = "#ffb347";
          ctx.shadowBlur = 8;
          ctx.strokeStyle = "#ffb347";
          ctx.lineWidth = 1.4;
        } else {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#888";
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 2);
        ctx.lineTo(x - 2, y + 2);
        ctx.lineTo(x + 2, y - 2);
        ctx.lineTo(x + 6, y + 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.ellipse(x - 7, y - 8, 3, 9, -0.2, 0, Math.PI * 2);
        ctx.fill();

        if (lightOn) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const halo = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.6);
          halo.addColorStop(0, "rgba(255, 210, 150, 0.25)");
          halo.addColorStop(1, "rgba(255, 210, 150, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      };

      const drawRipple = (x: number, y: number) => {
        if (!lightOn) return;
        const now = performance.now();
        const period = 1200; 
        for (let k = 0; k < 2; k++) {
          const t = ((now + k * (period / 2)) % period) / period; 
          const alpha = (1 - t) * 0.18;
          const radius = 36 + t * 80; 
          const line = Math.max(0.5, 2 - t * 1.5);
          const color = `rgba(255, 179, 71, ${alpha})`;
          const ctx = (canvasRef.current as HTMLCanvasElement).getContext("2d")!;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.filter = "blur(2px)"; 
          ctx.strokeStyle = color;
          ctx.lineWidth = line;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      };

      const animate = () => {
        Engine.update(engine);
        if (Math.abs(bulb.position.x - ceiling.position.x) > 0.1) {
          Body.setPosition(bulb, { x: ceiling.position.x, y: bulb.position.y });
        }
        Body.setVelocity(bulb, { x: 0, y: bulb.velocity.y });
        const x = ceiling.position.x;
        const y = bulb.position.y;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRealisticLighting(x, y);
        drawBulb(x, y);
        drawRipple(x, y);
        frameRaf = requestAnimationFrame(animate);
      };

      const onResize = () => {
        resize();
        Body.setPosition(ceiling, { x: anchorX(), y: 40 });
        baseLength = canvas.height / 2 - 62;
        cord.length = Math.min(cord.length, Math.min(baseLength + 100, (canvas.height * 0.55) | 0));
        Body.setPosition(bulb, { x: ceiling.position.x, y: bulb.position.y });
        Body.setVelocity(bulb, { x: 0, y: 0 });
      };

      window.addEventListener("resize", onResize);
      frameRaf = requestAnimationFrame(animate);

      const themeButton = document.querySelector('[data-theme-toggle]') as HTMLElement | null;
      const handleThemeClick = () => {
        if (!cord) return;
        const longLen = Math.min(baseLength + 50, (canvas.height * 0.42) | 0);
        const shortLen = 85;
        requestAnimationFrame(() => {
          const isDark = document.documentElement.classList.contains("dark");
          const target = isDark ? longLen : shortLen;
          const start = cord.length;
          cleanupTween?.();
          cleanupTween = tween(start, target, 450, (v) => (cord.length = v));
        });
      };

      const disposeTimers: Array<() => void> = [];
      if (themeButton) themeButton.addEventListener("click", handleThemeClick);

      const observer = new MutationObserver(() => {
        lightOn = document.documentElement.classList.contains("dark");
        Body.setPosition(bulb, { x: ceiling.position.x, y: bulb.position.y });
        Body.setVelocity(bulb, { x: 0, y: 0 });
        const longLen = Math.min(baseLength + 50, (canvas.height * 0.42) | 0);
        const shortLen = 85;
        const target = lightOn ? longLen : shortLen;
        const start = cord.length;
        cleanupTween?.();
        cleanupTween = tween(start, target, 450, (v) => (cord.length = v));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      lightOn = document.documentElement.classList.contains("dark");

      {
        const longLen = Math.min(baseLength + 50, (canvas.height * 0.42) | 0);
        const shortLen = 85;
        cord.length = shortLen;
        Body.setPosition(bulb, { x: ceiling.position.x, y: ceiling.position.y + shortLen });
        if (lightOn) {
          cleanupTween?.();
          cleanupTween = tween(shortLen, longLen, 450, (v) => (cord.length = v));
        }
      }

      disposeRef.current = () => {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(frameRaf);
        cleanupTween?.();
        disposeTimers.forEach((fn) => fn());
        window.removeEventListener("resize", onResize);
        if (themeButton) themeButton.removeEventListener("click", handleThemeClick);
        observer.disconnect();
      };
    };

    setup();

    return () => {
      disposeRef.current?.();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}


