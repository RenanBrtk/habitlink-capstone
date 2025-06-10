import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, 
  ellipseOutline, 
  addOutline, 
  add, 
  home, 
  list, 
  book, 
  person,
  chevronForward,
  searchOutline,
  listOutline,
  calendarOutline
} from 'ionicons/icons';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});

addIcons({
  'checkmark-circle': checkmarkCircle,
  'ellipse-outline': ellipseOutline,
  'add-outline': addOutline,
  'add': add,
  'home': home,
  'list': list,
  'book': book,
  'person': person,
  'chevron-forward': chevronForward,
  'search-outline': searchOutline,
  'list-outline': listOutline,
  'calendar-outline': calendarOutline
});

