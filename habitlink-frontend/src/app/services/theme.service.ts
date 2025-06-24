import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkMode = false;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
    } else {
      // Check system preference
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.darkMode) {
      this.renderer.setAttribute(document.body, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(document.body, 'data-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  getCurrentTheme(): string {
    return this.darkMode ? 'dark' : 'light';
  }

  // Listen to system theme changes
  listenToSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.darkMode = e.matches;
        this.applyTheme();
      }
    });
  }
}
