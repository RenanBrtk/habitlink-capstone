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
  calendarOutline,
  checkmark,
  trashOutline,
  timeOutline,
  chevronDown,
  close,
  // Journal icons
  journalOutline,
  createOutline,
  happyOutline,
  thumbsUpOutline,
  removeOutline,
  sadOutline,
  warningOutline,
  pricetagOutline,
  lockClosedOutline,
  lockOpenOutline,
  trendingUpOutline,
  documentTextOutline,
  statsChartOutline,
  flameOutline,
  todayOutline,
  appsOutline,
  calendarClearOutline,
  sunnyOutline,
  moonOutline,
  arrowBack,
  // Profile icons
  settingsOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  mailOutline,
  cameraOutline
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
  'calendar-outline': calendarOutline,
  'checkmark': checkmark,
  'trash-outline': trashOutline,
  'time-outline': timeOutline,
  'chevron-down': chevronDown,
  'close': close,
  // Journal icons
  'journal-outline': journalOutline,
  'create-outline': createOutline,
  'happy-outline': happyOutline,
  'thumbs-up-outline': thumbsUpOutline,
  'remove-outline': removeOutline,
  'sad-outline': sadOutline,
  'warning-outline': warningOutline,
  'pricetag-outline': pricetagOutline,
  'lock-closed-outline': lockClosedOutline,
  'lock-closed': lockClosedOutline,
  'lock-open': lockOpenOutline,
  'trending-up-outline': trendingUpOutline,
  'document-text-outline': documentTextOutline,
  'stats-chart-outline': statsChartOutline,
  'flame-outline': flameOutline,
  'today-outline': todayOutline,
  'apps-outline': appsOutline,
  'calendar-clear-outline': calendarClearOutline,
  'sunny-outline': sunnyOutline,
  'moon-outline': moonOutline,
  'arrow-back': arrowBack,
  // Profile icons
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'information-circle-outline': informationCircleOutline,
  'mail-outline': mailOutline,
  'camera-outline': cameraOutline
});

