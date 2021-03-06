import { AuthGuard } from './routes.guard';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/create/post-create.component";
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";

const routes: Routes = [
    { path: '', component: PostListComponent },
    { path: 'create', component: PostCreateComponent ,canActivate:[AuthGuard] },
    { path: 'edit/:postId', component: PostCreateComponent ,canActivate:[AuthGuard]},
    { path: 'auth', loadChildren:"./auth/auth.module#AuthModule" },
 
];
@NgModule({
    imports:[RouterModule.forRoot(routes)],
    exports:[RouterModule],
    providers:[AuthGuard]
})
export class AppRoutingModule {}
