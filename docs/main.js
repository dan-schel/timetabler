"use strict";(()=>{var s={any:h,div:d,anchor:m,input:x,button:v,select:g,canvas:w};function h(t){let n=document.getElementById(t);if(n!=null)return n;throw new Error(`Element with id "#${t}" not found.`)}function o(t,n,u){let i=h(t);if(u(i))return i;throw new Error(`Element with id "#${t}" is not a "${n}".`)}function d(t){return o(t,"HTMLDivElement",n=>n instanceof HTMLDivElement)}function m(t){return o(t,"HTMLAnchorElement",n=>n instanceof HTMLAnchorElement)}function x(t){return o(t,"HTMLInputElement",n=>n instanceof HTMLInputElement)}function v(t){return o(t,"HTMLButtonElement",n=>n instanceof HTMLButtonElement)}function g(t){return o(t,"HTMLSelectElement",n=>n instanceof HTMLSelectElement)}function w(t){return o(t,"HTMLCanvasElement",n=>n instanceof HTMLCanvasElement)}var e={controls:s.any("controls"),canvasContainer:s.div("canvas-container"),canvas:s.canvas("canvas"),mobileExpanderButton:s.button("mobile-expander-button")},E=(()=>({colorInk80:getComputedStyle(e.canvas).getPropertyValue("--color-ink-80")}))(),r=(()=>{let t=e.canvas.getContext("2d");if(t==null)throw new Error("Cannot get canvas context");return t})(),a=0,l=0,c=1;f();window.addEventListener("resize",()=>f());e.mobileExpanderButton.addEventListener("click",()=>{console.log("hello"),e.controls.classList.toggle("collapsed")});function f(){let t=e.canvasContainer.getBoundingClientRect();a=t.width,l=t.height;let n=e.canvas.getContext("2d");if(n==null)throw new Error("Cannot get canvas context");c=L(n),e.canvas.style.width=`${a}px`,e.canvas.style.height=`${l}px`,e.canvas.width=a*c,e.canvas.height=l*c,_()}function _(){r.save(),r.scale(c,c),r.font="1rem Atkinson Hyperlegible",r.fillStyle=E.colorInk80,r.fillText("Word",a-30,l-30),r.restore()}function L(t){var i,p;let n=(i=window.devicePixelRatio)!=null?i:1,u=(p=t.backingStorePixelRatio)!=null?p:1;return n/u}})();
