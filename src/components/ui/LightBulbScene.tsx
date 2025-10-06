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
    let frameRaf = 0;
    let brightness = 1;
    let lightOn = document.documentElement.classList.contains("dark");
    let destroyed = false;
    let cleanupTween: (() => void) | null = null;

    let anchorX = 0;
    const anchorY = 40;
    let baseLength = 0;
    let currentLen = 0;
    let targetLen = 0;
    let animating = false;


    let lastRender = 0;
    const targetFrameMs = 1000 / 45; 
    let activeUntil = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe;

    function render() {
      if (destroyed) return;
      const now = performance.now();
      if (now - lastRender < targetFrameMs) return;
      lastRender = now;

      const c = canvasRef.current!;
      const x = anchorX;
      const bob = lightOn ? Math.sin(now / 450) * 1.0 : 0;
      const y = anchorY + currentLen + bob;
      ctx.clearRect(0, 0, c.width, c.height);
      drawRealisticLighting(x, y);
      drawBulb(x, y);
      if (now < activeUntil && lightOn) drawRipple(x, y);
    }

    function loop() {
      render();
      if (animating || (lightOn && performance.now() < activeUntil)) {
        frameRaf = requestAnimationFrame(loop);
      } else {
        frameRaf = 0;
      }
    }

    function startLoop() {
      if (!frameRaf) frameRaf = requestAnimationFrame(loop);
    }

    function maybeStartLoop() {
      if (lightOn || animating) startLoop();
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      anchorX = window.innerWidth - 60;
      baseLength = window.innerHeight / 2 - 62;
      const longLen = Math.min(baseLength + 50, (window.innerHeight * 0.42) | 0);
      const shortLen = 85;
      currentLen = Math.min(Math.max(currentLen || shortLen, shortLen), longLen);
      targetLen = lightOn ? longLen : shortLen;
      maybeStartLoop();
    };

    const drawRealisticLighting = (x: number, y: number) => {
      brightness += (lightOn ? 1 : 0 - brightness) * 0.08;
      if (brightness <= 0.01) return;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 520);
      gradient.addColorStop(0, `rgba(255, 240, 200, ${0.45 * brightness})`);
      gradient.addColorStop(0.4, `rgba(255, 220, 170, ${0.18 * brightness})`);
      gradient.addColorStop(1, "rgba(150, 120, 100, 0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 520, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    };

    const drawBulb = (x: number, y: number) => {
      ctx.save();
      ctx.globalAlpha = 0.95;

      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(x, y - 28);
      ctx.stroke();

      ctx.fillStyle = "#9aa1a7";
      ctx.strokeStyle = "#7b8085";
      ctx.lineWidth = 1;
      const capWidth = 22;
      const capHeight = 10;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(x - capWidth / 2, y - 28, capWidth, capHeight, 2);
      } else {
        const rx = 2;
        const left = x - capWidth / 2;
        const top = y - 28;
        const right = left + capWidth;
        const bottom = top + capHeight;
        ctx.moveTo(left + rx, top);
        ctx.lineTo(right - rx, top);
        ctx.arcTo(right, top, right, top + rx, rx);
        ctx.lineTo(right, bottom - rx);
        ctx.arcTo(right, bottom, right - rx, bottom, rx);
        ctx.lineTo(left + rx, bottom);
        ctx.arcTo(left, bottom, left, bottom - rx, rx);
        ctx.lineTo(left, top + rx);
        ctx.arcTo(left, top, left + rx, top, rx);
      }
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
        ctx.shadowBlur = 6;
        ctx.strokeStyle = "#ffb347";
        ctx.lineWidth = 1.3;
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

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(x - 7, y - 8, 3, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();

      if (lightOn) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const halo = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.5);
        halo.addColorStop(0, "rgba(255, 210, 150, 0.22)");
        halo.addColorStop(1, "rgba(255, 210, 150, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    const drawRipple = (x: number, y: number) => {
      const now = performance.now();
      const period = 1000;
      const waves = 1;
      for (let k = 0; k < waves; k++) {
        const t = ((now + k * (period / 2)) % period) / period;
        const alpha = (1 - t) * 0.14;
        const radius = 32 + t * 70;
        const line = Math.max(0.5, 1.6 - t * 1.2);
        const color = `rgba(255, 179, 71, ${alpha})`;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = color;
        ctx.lineWidth = line;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    function startAnimateTo(len: number) {
      const from = currentLen;
      const to = len;
      animating = true;
      activeUntil = performance.now() + 900;
      cleanupTween?.();
      cleanupTween = tween(from, to, 450, v => { currentLen = v; }, () => {
        animating = false;
        if (!lightOn) {
          render();
        }
      });
      startLoop();
    }

    resize();
    const longLen0 = Math.min(baseLength + 50, (window.innerHeight * 0.42) | 0);
    const shortLen0 = 85;
    currentLen = shortLen0;
    targetLen = lightOn ? longLen0 : shortLen0;
    if (lightOn) startAnimateTo(targetLen); else render();

    const themeButton = document.querySelector('[data-theme-toggle]') as HTMLElement | null;
    const handleThemeClick = () => {
      requestAnimationFrame(() => {
        lightOn = document.documentElement.classList.contains("dark");
        const longLen = Math.min(baseLength + 50, (window.innerHeight * 0.42) | 0);
        const shortLen = 85;
        targetLen = lightOn ? longLen : shortLen;
        startAnimateTo(targetLen);
      });
    };
    if (themeButton) themeButton.addEventListener("click", handleThemeClick);

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      if (dark === lightOn) return;
      lightOn = dark;
      const longLen = Math.min(baseLength + 50, (window.innerHeight * 0.42) | 0);
      const shortLen = 85;
      targetLen = lightOn ? longLen : shortLen;
      startAnimateTo(targetLen);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", resize);

    disposeRef.current = () => {
      if (destroyed) return;
      destroyed = true;
      if (frameRaf) cancelAnimationFrame(frameRaf);
      cleanupTween?.();
      window.removeEventListener("resize", resize);
      if (themeButton) themeButton.removeEventListener("click", handleThemeClick);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}


