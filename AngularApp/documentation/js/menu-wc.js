'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">angular-app documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppCommonModule.html" data-type="entity-link" >AppCommonModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' : 'data-target="#xs-components-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' :
                                            'id="xs-components-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' }>
                                            <li class="link">
                                                <a href="components/AutocompleteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutocompleteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ContactTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ContactTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FaqComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FaqComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeExpandablePanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeExpandablePanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MiddlePanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MiddlePanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MigrationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MigrationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' : 'data-target="#xs-directives-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' :
                                        'id="xs-directives-links-module-AppCommonModule-0a42c912c4430747ec3608c4f8e78a9b0a18c2286cb2aed765858a55c8ad1d6f7b9fa0d95a5c898cf5424a7c42093168a1f934eb9b9f8ca9acc2a703599ba492"' }>
                                        <li class="link">
                                            <a href="directives/CheckPermissionsDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CheckPermissionsDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppCommonRoutingModule.html" data-type="entity-link" >AppCommonRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppCoreModule.html" data-type="entity-link" >AppCoreModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppCoreModule-e477ba3e4a6a5416ea13b3aac7479a1bbbb6de177d34f14b540910dc82c76edd55899471b69b055252ffe5bd3c9ba62e9236b79ca94ed114757914e5e6b343b5"' : 'data-target="#xs-injectables-links-module-AppCoreModule-e477ba3e4a6a5416ea13b3aac7479a1bbbb6de177d34f14b540910dc82c76edd55899471b69b055252ffe5bd3c9ba62e9236b79ca94ed114757914e5e6b343b5"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppCoreModule-e477ba3e4a6a5416ea13b3aac7479a1bbbb6de177d34f14b540910dc82c76edd55899471b69b055252ffe5bd3c9ba62e9236b79ca94ed114757914e5e6b343b5"' :
                                        'id="xs-injectables-links-module-AppCoreModule-e477ba3e4a6a5416ea13b3aac7479a1bbbb6de177d34f14b540910dc82c76edd55899471b69b055252ffe5bd3c9ba62e9236b79ca94ed114757914e5e6b343b5"' }>
                                        <li class="link">
                                            <a href="injectables/WindowRefService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WindowRefService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppLayoutModule.html" data-type="entity-link" >AppLayoutModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppLayoutModule-800f004312ec0895a6bd51af4aac34000dced4d26e3e9a3ee9bdfd124b5beecc29a3b86e476b512104d34a05930590d4b00cdc5a4bf36e319e4ab6033002a824"' : 'data-target="#xs-components-links-module-AppLayoutModule-800f004312ec0895a6bd51af4aac34000dced4d26e3e9a3ee9bdfd124b5beecc29a3b86e476b512104d34a05930590d4b00cdc5a4bf36e319e4ab6033002a824"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppLayoutModule-800f004312ec0895a6bd51af4aac34000dced4d26e3e9a3ee9bdfd124b5beecc29a3b86e476b512104d34a05930590d4b00cdc5a4bf36e319e4ab6033002a824"' :
                                            'id="xs-components-links-module-AppLayoutModule-800f004312ec0895a6bd51af4aac34000dced4d26e3e9a3ee9bdfd124b5beecc29a3b86e476b512104d34a05930590d4b00cdc5a4bf36e319e4ab6033002a824"' }>
                                            <li class="link">
                                                <a href="components/ContentLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ContentLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavLayoutComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-0776756e1739409b0c19e791dacf019acb6d3f6481b0d2ac34d631f67113db47d9b716617254190986892cf7a2a1f8599bdd70a7ad01d78ce6d11c413abe70e3"' : 'data-target="#xs-components-links-module-AppModule-0776756e1739409b0c19e791dacf019acb6d3f6481b0d2ac34d631f67113db47d9b716617254190986892cf7a2a1f8599bdd70a7ad01d78ce6d11c413abe70e3"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-0776756e1739409b0c19e791dacf019acb6d3f6481b0d2ac34d631f67113db47d9b716617254190986892cf7a2a1f8599bdd70a7ad01d78ce6d11c413abe70e3"' :
                                            'id="xs-components-links-module-AppModule-0776756e1739409b0c19e791dacf019acb6d3f6481b0d2ac34d631f67113db47d9b716617254190986892cf7a2a1f8599bdd70a7ad01d78ce6d11c413abe70e3"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppStructuralModule.html" data-type="entity-link" >AppStructuralModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppStructuralModule-a62f4d5d6cbc52ecd3a48788bf4cb8ba48902832ca513ba002edba2f0766213b43439917a6f4843bc6b7beeafbf8dab2d9d546cc764da9b52e5c18d58ac235f8"' : 'data-target="#xs-components-links-module-AppStructuralModule-a62f4d5d6cbc52ecd3a48788bf4cb8ba48902832ca513ba002edba2f0766213b43439917a6f4843bc6b7beeafbf8dab2d9d546cc764da9b52e5c18d58ac235f8"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppStructuralModule-a62f4d5d6cbc52ecd3a48788bf4cb8ba48902832ca513ba002edba2f0766213b43439917a6f4843bc6b7beeafbf8dab2d9d546cc764da9b52e5c18d58ac235f8"' :
                                            'id="xs-components-links-module-AppStructuralModule-a62f4d5d6cbc52ecd3a48788bf4cb8ba48902832ca513ba002edba2f0766213b43439917a6f4843bc6b7beeafbf8dab2d9d546cc764da9b52e5c18d58ac235f8"' }>
                                            <li class="link">
                                                <a href="components/AcousticChartComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AcousticChartComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AcousticComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AcousticComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AcousticPerformanceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AcousticPerformanceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfigureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisclaimerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisclaimerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DoorLeafActiveComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DoorLeafActiveComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DoorLeafPassiveComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DoorLeafPassiveComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DoubleVentTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DoubleVentTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FrameCombinationTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FrameCombinationTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FramingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FramingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FramingCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FramingCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GlassPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GlassPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GlassPanelTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GlassPanelTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HandleColorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HandleColorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HingeTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HingeTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IframeWrapperComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IframeWrapperComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InsideHandleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InsideHandleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InterlockProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InterlockProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftAcousticPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftAcousticPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftConfigureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftConfigureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftResultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftResultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftStructuralPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftStructuralPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LeftThermalPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LeftThermalPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LibraryCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LibraryCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoadComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ModelCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ModelCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MullionDepthTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MullionDepthTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MullionTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MullionTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OperabilityComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OperabilityComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderProgressComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderProgressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrdersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OuterTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OuterTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OutsideHandleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OutsideHandleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileColorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileColorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReinforcementProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReinforcementProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportGeneralComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportGeneralComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ResultGeneralComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResultGeneralComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RightConfigureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RightConfigureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RightReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RightReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RightResultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RightResultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SillProfileBottomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SillProfileBottomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SillProfileFixedComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SillProfileFixedComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SlidingUnitComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SlidingUnitComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SpacerTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpacerTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StructuralComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StructuralComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StructuralProfileTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StructuralProfileTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StructuralTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StructuralTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ThermalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ThermalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TooltipCustomComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TooltipCustomComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VentTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VentTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ViewerInfillComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ViewerInfillComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppStructuralRoutingModule.html" data-type="entity-link" >AppStructuralRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AccessRole.html" data-type="entity-link" >AccessRole</a>
                            </li>
                            <li class="link">
                                <a href="classes/Account.html" data-type="entity-link" >Account</a>
                            </li>
                            <li class="link">
                                <a href="classes/Acoustic.html" data-type="entity-link" >Acoustic</a>
                            </li>
                            <li class="link">
                                <a href="classes/AcousticUIOutput.html" data-type="entity-link" >AcousticUIOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/Address.html" data-type="entity-link" >Address</a>
                            </li>
                            <li class="link">
                                <a href="classes/AnalysisResult.html" data-type="entity-link" >AnalysisResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArticleSection.html" data-type="entity-link" >ArticleSection</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsAcousticResult.html" data-type="entity-link" >BpsAcousticResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsBoundaryCondition.html" data-type="entity-link" >BpsBoundaryCondition</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsProject.html" data-type="entity-link" >BpsProject</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsSimplifiedProblem.html" data-type="entity-link" >BpsSimplifiedProblem</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsUnifiedModel.html" data-type="entity-link" >BpsUnifiedModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/BpsUnifiedProblem.html" data-type="entity-link" >BpsUnifiedProblem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Cavity.html" data-type="entity-link" >Cavity</a>
                            </li>
                            <li class="link">
                                <a href="classes/Classification.html" data-type="entity-link" >Classification</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollapsedPanelStatus.html" data-type="entity-link" >CollapsedPanelStatus</a>
                            </li>
                            <li class="link">
                                <a href="classes/Contact.html" data-type="entity-link" >Contact</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomGlass.html" data-type="entity-link" >CustomGlass</a>
                            </li>
                            <li class="link">
                                <a href="classes/DealerModel.html" data-type="entity-link" >DealerModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/DinWindLoadInput.html" data-type="entity-link" >DinWindLoadInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/DoorLeafArticle.html" data-type="entity-link" >DoorLeafArticle</a>
                            </li>
                            <li class="link">
                                <a href="classes/DoorSystem.html" data-type="entity-link" >DoorSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/FabricatorModel.html" data-type="entity-link" >FabricatorModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeBC.html" data-type="entity-link" >FacadeBC</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeInsertUnit.html" data-type="entity-link" >FacadeInsertUnit</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeMullion.html" data-type="entity-link" >FacadeMullion</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeMullionReinforcement.html" data-type="entity-link" >FacadeMullionReinforcement</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeProfile.html" data-type="entity-link" >FacadeProfile</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeSection.html" data-type="entity-link" >FacadeSection</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeSpacer.html" data-type="entity-link" >FacadeSpacer</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeStructuralMemberResult.html" data-type="entity-link" >FacadeStructuralMemberResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeStructuralResult.html" data-type="entity-link" >FacadeStructuralResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeTransom.html" data-type="entity-link" >FacadeTransom</a>
                            </li>
                            <li class="link">
                                <a href="classes/FacadeUDC.html" data-type="entity-link" >FacadeUDC</a>
                            </li>
                            <li class="link">
                                <a href="classes/FeatureModel.html" data-type="entity-link" >FeatureModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/FrameSeg.html" data-type="entity-link" >FrameSeg</a>
                            </li>
                            <li class="link">
                                <a href="classes/FrameSegment.html" data-type="entity-link" >FrameSegment</a>
                            </li>
                            <li class="link">
                                <a href="classes/FrameSystem.html" data-type="entity-link" >FrameSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Geometry.html" data-type="entity-link" >Geometry</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlassBPS.html" data-type="entity-link" >GlassBPS</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlassGeometricInfo.html" data-type="entity-link" >GlassGeometricInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlassSRS.html" data-type="entity-link" >GlassSRS</a>
                            </li>
                            <li class="link">
                                <a href="classes/GlazingSystem.html" data-type="entity-link" >GlazingSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Hardware.html" data-type="entity-link" >Hardware</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpObject.html" data-type="entity-link" >HttpObject</a>
                            </li>
                            <li class="link">
                                <a href="classes/IFrameEvent.html" data-type="entity-link" >IFrameEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/IFrameExchangeData.html" data-type="entity-link" >IFrameExchangeData</a>
                            </li>
                            <li class="link">
                                <a href="classes/Infill.html" data-type="entity-link" >Infill</a>
                            </li>
                            <li class="link">
                                <a href="classes/InsertedUnitPerSystem.html" data-type="entity-link" >InsertedUnitPerSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoadFactor.html" data-type="entity-link" >LoadFactor</a>
                            </li>
                            <li class="link">
                                <a href="classes/LossDistributionPoint.html" data-type="entity-link" >LossDistributionPoint</a>
                            </li>
                            <li class="link">
                                <a href="classes/MachiningInfo.html" data-type="entity-link" >MachiningInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/Member.html" data-type="entity-link" >Member</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModelInput.html" data-type="entity-link" >ModelInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/OperabilitySystem.html" data-type="entity-link" >OperabilitySystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderApiModel.html" data-type="entity-link" >OrderApiModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderDetailsApiModel.html" data-type="entity-link" >OrderDetailsApiModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderModel.html" data-type="entity-link" >OrderModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderStatusApiModel.html" data-type="entity-link" >OrderStatusApiModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/PanelSystem.html" data-type="entity-link" >PanelSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/Plate.html" data-type="entity-link" >Plate</a>
                            </li>
                            <li class="link">
                                <a href="classes/Point.html" data-type="entity-link" >Point</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProblemSetting.html" data-type="entity-link" >ProblemSetting</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectInfo.html" data-type="entity-link" >ProjectInfo</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectInfoInputModule.html" data-type="entity-link" >ProjectInfoInputModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/Reinforcement.html" data-type="entity-link" >Reinforcement</a>
                            </li>
                            <li class="link">
                                <a href="classes/RenameProblemInputModule.html" data-type="entity-link" >RenameProblemInputModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/SeasonFactor.html" data-type="entity-link" >SeasonFactor</a>
                            </li>
                            <li class="link">
                                <a href="classes/Section.html" data-type="entity-link" >Section</a>
                            </li>
                            <li class="link">
                                <a href="classes/ShippingAddressModel.html" data-type="entity-link" >ShippingAddressModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/SlabAnchor.html" data-type="entity-link" >SlabAnchor</a>
                            </li>
                            <li class="link">
                                <a href="classes/SlidingDoorSystem.html" data-type="entity-link" >SlidingDoorSystem</a>
                            </li>
                            <li class="link">
                                <a href="classes/SpliceJoint.html" data-type="entity-link" >SpliceJoint</a>
                            </li>
                            <li class="link">
                                <a href="classes/SRSExtendedData.html" data-type="entity-link" >SRSExtendedData</a>
                            </li>
                            <li class="link">
                                <a href="classes/SRSProblemSetting.html" data-type="entity-link" >SRSProblemSetting</a>
                            </li>
                            <li class="link">
                                <a href="classes/StoreAddressModel.html" data-type="entity-link" >StoreAddressModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/Structural.html" data-type="entity-link" >Structural</a>
                            </li>
                            <li class="link">
                                <a href="classes/StructuralMemberResult.html" data-type="entity-link" >StructuralMemberResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/StructuralResult.html" data-type="entity-link" >StructuralResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/SystemData.html" data-type="entity-link" >SystemData</a>
                            </li>
                            <li class="link">
                                <a href="classes/TempChange.html" data-type="entity-link" >TempChange</a>
                            </li>
                            <li class="link">
                                <a href="classes/Thermal.html" data-type="entity-link" >Thermal</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalFacadeMember.html" data-type="entity-link" >ThermalFacadeMember</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalFrame.html" data-type="entity-link" >ThermalFrame</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalGlass.html" data-type="entity-link" >ThermalGlass</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalGlassEdge.html" data-type="entity-link" >ThermalGlassEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalInsertUnitFrame.html" data-type="entity-link" >ThermalInsertUnitFrame</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalOutput.html" data-type="entity-link" >ThermalOutput</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalPanel.html" data-type="entity-link" >ThermalPanel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalPanelEdge.html" data-type="entity-link" >ThermalPanelEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalResult.html" data-type="entity-link" >ThermalResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIFacadeGlassEdge.html" data-type="entity-link" >ThermalUIFacadeGlassEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIGlass.html" data-type="entity-link" >ThermalUIGlass</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIGlassEdge.html" data-type="entity-link" >ThermalUIGlassEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIInsertUnitFrameEdge.html" data-type="entity-link" >ThermalUIInsertUnitFrameEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIPanel.html" data-type="entity-link" >ThermalUIPanel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ThermalUIPanelEdge.html" data-type="entity-link" >ThermalUIPanelEdge</a>
                            </li>
                            <li class="link">
                                <a href="classes/UDCStructuralMemberResult.html" data-type="entity-link" >UDCStructuralMemberResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/UDCStructuralResult.html" data-type="entity-link" >UDCStructuralResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/User-1.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotesInputModule.html" data-type="entity-link" >UserNotesInputModule</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserSetting.html" data-type="entity-link" >UserSetting</a>
                            </li>
                            <li class="link">
                                <a href="classes/VentFrame.html" data-type="entity-link" >VentFrame</a>
                            </li>
                            <li class="link">
                                <a href="classes/WindLoadOutput.html" data-type="entity-link" >WindLoadOutput</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppconstantsService.html" data-type="entity-link" >AppconstantsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseServiceService.html" data-type="entity-link" >BaseServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CommonService.html" data-type="entity-link" >CommonService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigPanelsService.html" data-type="entity-link" >ConfigPanelsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigureService.html" data-type="entity-link" >ConfigureService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DownloadService.html" data-type="entity-link" >DownloadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FramingService.html" data-type="entity-link" >FramingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HomeService.html" data-type="entity-link" >HomeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpErrorHandler.html" data-type="entity-link" >HttpErrorHandler</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IframeService.html" data-type="entity-link" >IframeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStorageService.html" data-type="entity-link" >LocalStorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoginService.html" data-type="entity-link" >LoginService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NavLayoutService.html" data-type="entity-link" >NavLayoutService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionService.html" data-type="entity-link" >PermissionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportService.html" data-type="entity-link" >ReportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ResultService.html" data-type="entity-link" >ResultService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UnifiedModelService.html" data-type="entity-link" >UnifiedModelService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ValidatePanelsService.html" data-type="entity-link" >ValidatePanelsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ValidationService.html" data-type="entity-link" >ValidationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WindowRefService.html" data-type="entity-link" >WindowRefService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/AuthInterceptor.html" data-type="entity-link" >AuthInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthToken.html" data-type="entity-link" >AuthToken</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});