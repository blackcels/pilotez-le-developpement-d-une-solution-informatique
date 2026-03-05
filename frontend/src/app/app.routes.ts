import { Routes } from '@angular/router';
import { UploadPageComponent } from './pages/upload-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { SignupPageComponent } from './pages/signup-page.component';
import { DownloadPageComponent } from './pages/download-page.component';
import { FilesPageComponent } from './pages/files-page.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'upload', pathMatch: 'full' },
	{ path: 'upload', component: UploadPageComponent },
	{ path: 'login', component: LoginPageComponent },
	{ path: 'signup', component: SignupPageComponent },
	{ path: 'download/:token', component: DownloadPageComponent },
	{ path: 'mes-fichiers', component: FilesPageComponent },
	{ path: '**', redirectTo: 'upload' }
];
