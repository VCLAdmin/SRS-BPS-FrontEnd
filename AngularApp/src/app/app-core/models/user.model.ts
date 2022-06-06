import { FeatureModel } from "./feature";

export class User {
    UserId: string;
    FirstName: string;
    LastName: string;
    MiddleName: string;
    UserName: string;
    Title: string;
    Email: string;
    SecondaryEmail: string;
    Website: string;
    PrimaryPhone: string;
    SecondaryPhone: string;
    FaxNumber: string;
    UserType: string;
    Active: boolean;
    CustomerName: string;
    FullName: string;
    DefaultLanguage: string;
    MeasurementSystem: string;
    TimeZone: string;
    Supervisor: string;
    UserSignature: string;
    CustomerId: string;
    Theme: string;
    Nickname: string;
    Initials: string;
    ActiveStatus: string;
    SalesContactExternalId: string;
    SalesContactName: string;
    EmailStatus: string;
    LogoUrl: string;
    UserRole: string;
    TitleDescription: string;
    SupervisorName: string;
    EmployerExternalId: string;
    AddressList: string[];
    EmployerType: string;
    CompanyName: string;
    Support: boolean;
    UserFullName: string;
    CRMDashboard: any;
    FirstLoggedOn: string = '';
    LastLoggedOn: string = '';

    AccessRoles: string[];
    Company: string;

    Features: FeatureModel[];

    constructor(
        UserId: string,
        FirstName: string,
        LastName: string,
        MiddleName: string,
        Title: string,
        Email: string,
        SecondaryEmail: string,
        Website: string,
        PrimaryPhone: string,
        SecondaryPhone: string,
        FaxNumber: string,
        UserType: string,
        Active: boolean,
        CustomerName: string,
        FullName: string,
        DefaultLanguage: string,
        MeasurementSystem: string,
        TimeZone: string,
        Supervisor: string,
        UserSignature: string,
        CustomerId: string,
        Theme: string,
        Nickname: string,
        Initials: string,
        ActiveStatus: string,
        SalesContactExternalId: string,
        SalesContactName: string,
        EmailStatus: string,
        LogoUrl: string,
        UserRole: string,
        TitleDescription: string,
        SupervisorName: string,
        EmployerExternalId: string,
        AddressList: string[],
        EmployerType: string,
        CompanyName: string,
        Support: boolean,
        FirstLoggedOn: string = '',
        LastLoggedOn: string = ''
    ) {
        this.UserId = UserId;
        this.FirstName = FirstName;
        this.LastName = LastName;
        this.MiddleName = MiddleName;
        this.Title = Title;
        this.Email = Email;
        this.SecondaryEmail = SecondaryEmail;
        this.Website = Website;
        this.PrimaryPhone = PrimaryPhone;
        this.SecondaryPhone = SecondaryPhone;
        this.FaxNumber = FaxNumber;
        this.UserType = UserType;
        this.Active = Active;
        this.CustomerName = CustomerName;
        this.FullName = FullName;
        this.DefaultLanguage = DefaultLanguage;
        this.MeasurementSystem = MeasurementSystem;
        this.TimeZone = TimeZone;
        this.Supervisor = Supervisor;
        this.UserSignature = UserSignature;
        this.CustomerId = CustomerId;
        this.Theme = Theme;
        this.Nickname = Nickname;
        this.Initials = Initials;
        this.ActiveStatus = ActiveStatus;
        this.SalesContactExternalId = SalesContactExternalId;
        this.SalesContactName = SalesContactName;
        this.EmailStatus = EmailStatus;
        this.LogoUrl = LogoUrl;
        this.UserRole = UserRole;
        this.TitleDescription = TitleDescription;
        this.SupervisorName = SupervisorName;
        this.EmployerExternalId = EmployerExternalId;
        this.AddressList = [];
        this.EmployerType = EmployerType;
        this.CompanyName = CompanyName;
        this.Support = Support;
        this.UserName = FirstName + ' ' + LastName;
        this.UserFullName = FirstName + ' ' + MiddleName + ' ' + LastName;
        this.FirstLoggedOn = FirstLoggedOn;
        this.LastLoggedOn = LastLoggedOn;
    }
}


