import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';
import { DashboardPage } from './DashboardPage';
import { ProjectPage } from './ProjectPage';
import { MapPage } from './MapPage';
import { ForgotPasswordPage } from './ForgotPassword';
import { ResetPasswordPage } from './ResetPassword';
import { MapSidebarPage } from './mapSidebarPage';
import { MeasurementPage } from './MeasurementPage';
import { AdminApprovalPage } from './AdminApprovalPage';
import { ThreeDMapPage } from './ThreeDMapPage';
import { IssuePage } from './IssuePage';
import { UserPage } from './UserPage';
import { CreateProjectPage } from './CreateProjectPage';
import { ProjectSidebarPage } from './ProjectSidebarPage';
import { OrganizationPage } from './OrganizationPage';
import { OrganizationProjectPage } from './OrganizationProject';
import { PhotoGallery } from './PhotoGallery';
import { IndoorPage } from './IndoorPage';


export class PageManager {
    private page: Page;
    private loginPage?: LoginPage;
    private signupPage?: SignupPage;
    private dashboardPage?: DashboardPage;
    private projectPage?: ProjectPage;
    private mapPage?: MapPage;
    private threeDMapPage?: ThreeDMapPage;
    private forgotPasswordPage?: ForgotPasswordPage;
    private resetPasswordPage?: ResetPasswordPage;
    private mapSidebarPage?: MapSidebarPage;
    private adminLoginPage?: AdminApprovalPage;
    private projectSidebarPage?: ProjectSidebarPage;
    private measurementPage?: MeasurementPage;
    private issuePage?: IssuePage;
    private userPage?: UserPage;
    private createProjectPage?: CreateProjectPage;
    private organizationPage?: OrganizationPage;
    private photoGallery?: PhotoGallery;
    private organizationProjectPage?: OrganizationProjectPage;
    private indoorPage?: IndoorPage;

    constructor(page: Page) {
        this.page = page;
    }

    get getPage() {
        return this.page;
    }

    get onAdminPage(): AdminApprovalPage {
        if (!this.adminLoginPage) this.adminLoginPage = new AdminApprovalPage(this.page);
        return this.adminLoginPage;
    }

    get onLoginPage(): LoginPage {
        if (!this.loginPage) this.loginPage = new LoginPage(this.page);
        return this.loginPage;
    }

    get onSignupPage(): SignupPage {
        if (!this.signupPage) this.signupPage = new SignupPage(this.page);
        return this.signupPage;
    }

    get onMapPage(): MapPage {
        if (!this.mapPage) this.mapPage = new MapPage(this.page);
        return this.mapPage;
    }

    get on3DMap(): ThreeDMapPage {
        if (!this.threeDMapPage) this.threeDMapPage = new ThreeDMapPage(this.page);
        return this.threeDMapPage;
    }

    get onDashboardPage(): DashboardPage {
        if (!this.dashboardPage) this.dashboardPage = new DashboardPage(this.page);
        return this.dashboardPage;
    }

    get onProjectPage(): ProjectPage {
        if (!this.projectPage) this.projectPage = new ProjectPage(this.page);
        return this.projectPage;
    }

    get onForgotPasswordPage(): ForgotPasswordPage {
        if (!this.forgotPasswordPage) this.forgotPasswordPage = new ForgotPasswordPage(this.page);
        return this.forgotPasswordPage;
    }

    get onResetPasswordPage(): ResetPasswordPage {
        if (!this.resetPasswordPage) this.resetPasswordPage = new ResetPasswordPage(this.page);
        return this.resetPasswordPage;
    }

    get onMapSidebarPage(): MapSidebarPage {
        if (!this.mapSidebarPage) this.mapSidebarPage = new MapSidebarPage(this.page);
        return this.mapSidebarPage;
    }

    get onProjectSidebarPage(): ProjectSidebarPage {
        if (!this.projectSidebarPage) this.projectSidebarPage = new ProjectSidebarPage(this.page);
        return this.projectSidebarPage;
    }

    get onMeasurementPage(): MeasurementPage {
        if (!this.measurementPage) this.measurementPage = new MeasurementPage(this.page);
        return this.measurementPage;
    }

    get onIssuePage(): IssuePage {
        if (!this.issuePage) this.issuePage = new IssuePage(this.page);
        return this.issuePage;
    }

    get onUserPage(): UserPage {
        if (!this.userPage) this.userPage = new UserPage(this.page);
        return this.userPage;
    }

    get onCreateProjectPage(): CreateProjectPage {
        if (!this.createProjectPage) this.createProjectPage = new CreateProjectPage(this.page);
        return this.createProjectPage;
    }

    get onOrganizationPage(): OrganizationPage {
        if (!this.organizationPage) this.organizationPage = new OrganizationPage(this.page);
        return this.organizationPage;
    }
    get onPhotoGallery(): PhotoGallery {
        if (!this.photoGallery) this.photoGallery = new PhotoGallery(this.page);
        return this.photoGallery;
    }

    get onIndoorPage(): IndoorPage {
        if (!this.indoorPage) this.indoorPage = new IndoorPage(this.page);
        return this.indoorPage;
    }
    get onOrganizationProjectPage(): OrganizationProjectPage {
        if (!this.organizationProjectPage) this.organizationProjectPage = new OrganizationProjectPage(this.page);
        return this.organizationProjectPage;

    }
}
