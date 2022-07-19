import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { AppconstantsService } from "src/app/app-common/services/appconstants.service";
import { LoginService } from "src/app/app-common/services/login.service";

@Injectable({
  providedIn: "root",
})
export class NavLayoutService {
  constructor(
    private loginService: LoginService,
    private router: Router,
    private appConstants: AppconstantsService,
    private route: ActivatedRoute
  ) {}
  //#region Home & Login - Show Empty page and Nav Bar
  isEmptyPage: Subject<boolean> = new Subject<boolean>();
  private isNavBarShownSubject: Subject<boolean> = new Subject<boolean>();
  private isNavBarVisible: boolean = false;
  /**
   * Show or hide the nav bar
   * @param isVisible 
   */
  changeNavBarVisibility(isVisible: boolean): void {
    this.isNavBarVisible = isVisible;
    this.isNavBarShownSubject.next(this.isNavBarVisible);
  }

  /**
   * Change the display of the nav bar
   * @returns 
   */
  onChangeNavBarVisibility(): Observable<boolean> {
    if (this.isNavBarShownSubject !== undefined) {
      return this.isNavBarShownSubject.asObservable();
    } else {
      this.isNavBarShownSubject = new Subject<boolean>();
      return this.isNavBarShownSubject.asObservable();
    }
  }
  //#endregion

  //#region set get Current ProjectId from route param
  private currentProjectId: string = "";
  /**
   * Get the current project id from the url (or take the default one if null) and save it in a variable
   * @returns 
   */
  getCurrentProjectId(): string {
    // we need to check for all the children of the route to get the param
    let id = this.getRouteParam("projectId");
    if (id === null || id === undefined) {
      id = this.appConstants.DEFAULT_GUID;
    }
    this.setCurrentProjectId(id);
    return this.currentProjectId;
  }

  /**
   * Save the id in a variable
   * @param id 
   */
  setCurrentProjectId(id: string): void {
    this.currentProjectId = id;
  }
  //#endregion
  
  //#region set & get nav bar buttons
  private isNavBarButtonAndTitleVisible: boolean;
  isNavBarButtonAndTitleShownSubject: Subject<boolean> = new Subject<boolean>();
  /**
   * Change the nav bar visibility
   * @param isVisible 
   */
  changeNavBarButtonAndTitleVisibility(isVisible: boolean): void {
    this.isNavBarButtonAndTitleVisible = isVisible;
    this.isNavBarButtonAndTitleShownSubject.next(this.isNavBarButtonAndTitleVisible);
  }
  /**
   * Set the nav bar visibility
   */
  setNavBarButtonAndTitleVisibility(): void {
    this.isNavBarButtonAndTitleShownSubject.next(this.isNavBarButtonAndTitleVisible);
  }
  //#endregion

 // #region to display the nav bar and nav bar title display
  /**
   * 
   * @param isEmpty 
   * @param navBarVisibility Show/Hide the nav bar
   * @param navBarAndTitleVisibility Show/Hide the title of the nav bar
   */
 changeNavBarSettings(isEmpty: boolean, navBarVisibility: boolean, navBarAndTitleVisibility: boolean) {
   this.isNavBarButtonAndTitleVisible = navBarAndTitleVisibility;
   this.isNavBarVisible = navBarVisibility;
   this.isEmptyPage.next(isEmpty);
   this.isNavBarButtonAndTitleShownSubject.next(navBarAndTitleVisibility);
   this.isNavBarShownSubject.next(navBarVisibility);
 }
  

 // #endregion

  //#region Dealer Information
  resetUserInfoSubject: Subject<boolean> = new Subject<boolean>();
  /**
   * Reset the dealer info
   * @param doRefresh 
   */
  resetDealerInfo(doRefresh: boolean): void {
    this.resetUserInfoSubject.next(doRefresh);
  }
  //#endregion

  //#region show hide Previous Arrow
  deletePreviousArrowSubject: Subject<Boolean> = new Subject<Boolean>();
  deletePreviousArrow() {
    this.deletePreviousArrowSubject.next(true);
  }
  
  //#endregion

  //#region get Version Information
  public GetVersionInformation(): Observable<any> {
    return this.loginService.GetVersionInformation();
  }  
  //#endregion

  //#region route
  /**
   * returns the route segment without any parameter definition
   * @param routeUrl route definition with parameters included
   */
  private _getRouteSegmentFromPath(routeUrl: string): string {
    // we need to remove the parameters definition in case that exists
    // we will use only the actual route definition for comparison
    const path = routeUrl.split(":");
    if (path.length > 0 && path[0].charAt(path[0].length - 1) === "/") {
      // the last character of the route is a / symbol, we need to remove it
      return path[0].substring(0, path[0].length - 1);
    }
    // if the url doesn't ends with a / symbol we return the url section of the path
    return path[0];
  }

  /**
   * DO NOT USE, FOR INTERNAL USE ONLY
   * return the value of the specified paramId from the url, returns undefined if
   * the paramId should not exists in that route
   * @param paramId id of the parameter we need to look for
   * @param url url to look te param
   */
  private _getParamFromUrl(url: string, paramId: string): string | undefined {
    let result: string | undefined;
    const config = this.router.config;
    // we need to find the current route in the config first
    if (url.length > 0) {
      config.forEach((route) => {
        const parentUrlSegment = this._getRouteSegmentFromPath(route.path!);
        if (url.length > 0 && url.includes(parentUrlSegment)) {
          if (route.children !== undefined) {
            route.children.forEach((child) => {
              const childUrlSegment = this._getRouteSegmentFromPath(
                child.path!
              );
              if (url.includes(childUrlSegment)) {
                // after we found the current route in the config we search for the param string
                // if the route should contain that param we return the data if not we return undefined
                if (
                  child.path!.length > 0 &&
                  child.path!.includes(":" + paramId)
                ) {
                  // the route should have the param so we return the value from the current route parameters
                  // this value could be empty if none is provided
                  const value = this._getRouteParam(paramId, null);
                  result = value !== null ? value : "";
                  return;
                } else if (!result) {
                  // the parameter should not exist in the route so we return undefined
                  result = undefined;
                  return;
                }
              }
            });
          }
        }
      });
    }
    // if the url is nont found is safe to assume that the paramId is wrong and shouldn't exist
    // in teory this point should never be reached if the url and paraId are correct
    return result!;
  }

  /**
   * return the value of the specified paramId from a custom url and the respective route snapshot, returns undefined if
   * the paramId should not exists in that route
   * @param paramId id of the parameter we need to look for
   * @param url url to look te param
   */
  getParamFromRouteSnapshot(
    url: string,
    paramId: string,
    routeSnapshot: ActivatedRouteSnapshot
  ): string | undefined {
    let result: string | undefined;
    const config = this.router.config;
    // we need to find the current route in the config first
    if (url.length > 0) {
      config.forEach((route) => {
        const parentUrlSegment = this._getRouteSegmentFromPath(route.path!);
        if (url.length > 0 && url.includes(parentUrlSegment)) {
          if (route.children !== undefined) {
            route.children.forEach((child) => {
              const childUrlSegment = this._getRouteSegmentFromPath(
                child.path!
              );
              if (url.includes(childUrlSegment)) {
                // after we found the current route in the config we search for the param string
                // if the route should contain that param we return the data if not we return undefined
                if (
                  child.path!.length > 0 &&
                  child.path!.includes(":" + paramId)
                ) {
                  // the route should have the param so we return the value from the current route parameters
                  // this value could be empty if none is provided
                  const value = this._getRouteParam(paramId, routeSnapshot);
                  result = value !== null ? value : "";
                  return;
                } else if (!result) {
                  // the parameter should not exist in the route so we return undefined
                  result = undefined;
                  return;
                }
              }
            });
          }
        }
      });
    }
    // if the url is nont found is safe to assume that the paramId is wrong and shouldn't exist
    // in teory this point should never be reached if the url and paraId are correct
    return result!;
  }

  /**
   * this function search for a parameter in the current route tree
   * @param paramId key to search for
   */
  private _getRouteParam(
    paramId: string,
    route: ActivatedRouteSnapshot | null
  ): string | null {
    // we need to search for the parameter in the complete tree of the route,
    // return null if the param is not found
    // if the tree is defined we search in the tree, if not we need to search in the current route
    if (route !== undefined && route !== null) {
      return this._getRouteParamRecursive(paramId, route);
    }

    const currentRoute = this.route.snapshot;
    return this._getRouteParamRecursive(paramId, currentRoute);
  }

  private _getRouteParamRecursive(
    paramId: string,
    route: ActivatedRouteSnapshot
  ): string | null {
    let data = route.paramMap.get(paramId);

    if (data !== null) {
      return data;
    } else if (route.children.length > 0) {
      for (let i = 0; i < route.children.length; i++) {
        const childRoute = route.children[i];
        data = childRoute.paramMap.get(paramId);
        if (data !== null) {
          return data;
        } else {
          return this._getRouteParamRecursive(paramId, route.children[i]);
        }
      }
    } else {
      return null;
    }

    return null;
  }

  /**
   * return the value of the specified paramId from the route, returns undefined if
   * the paramId should not exists in the current route
   * @param paramId id of the parameter we need to look for
   */
  getRouteParam(paramId: string): string | undefined {
    const currentRoute = document.location.pathname;
    return this._getParamFromUrl(currentRoute, paramId);
  }

  /**
   * returns true if the url have the paramId defined in the config
   * @param url the url route to search for the parameter
   * @param paramId the id of the parameter to look for
   */
  hasParamDefined(url: string, paramId: string): boolean {
    const param = this._getParamFromUrl(url, paramId);
    return param !== undefined;
  }

  navigateToRoute(url: string): void {
    const tree = this.router.parseUrl(url);
    this.router.navigateByUrl(tree);
  }

  //#endregion
}
