// This is the default unified model for window
// const MockData =
// {
//   "UserSetting": {
//     "Language": "en-US",
//     "UserName": "Administrator"
//   },
//   "ProblemSetting": {
//     "UserGuid": "33e1b0a8-c208-4775-b43c-a5b0350f98b6",
//     "ProjectGuid": "86a58bb4-2064-4de0-a897-e8f807ce225b",
//     "ProblemGuid": "3fb4bb1c-367f-4585-8244-ec5e29ab18a1",
//     "EnableAcoustic": false,
//     "EnableStructural": true,
//     "EnableThermal": false,
//     "ProductType": "Window",
//     "FacadeType": null,
//     "ProjectName": "asdf",
//     "Location": "asdf",
//     "ConfigurationName": "Configuration 1",
//     "UserNotes": "",
//     "isAcousticEnabled": false
//   },
//   "SRSProblemSetting": {
//     "OrderNumber": "asdf",
//     "SubTotal": 863.0,
//     "Client": "asdf",
//     "ProjectNumber": "asdf",
//     "LastModifiedDate": "asdf"
//   },
//   "ModelInput": {
//     "FrameSystem": {
//       "SystemType": "AWS 75.SI+",
//       "UvalueType": "AIF",
//       "InsulationType": "Polyamide Anodized After",
//       "InsulatingBarDataNote": null,
//       "InsulationMaterial": "8",
//       "Alloys": "6060-T66 (150MPa)",
//       "xNumberOfPanels": 0,
//       "yNumberOfPanels": 0,
//       "VerticalJointWidth": 0,
//       "HorizontalJointWidth": 0,
//       "InsulationZone": null,
//       "WeatherTightness": null,
//       "AluminumFinish": "Anodized",
//       "AluminumColor": "Traffic white - RAL 9016"
//     },
//     "Geometry": {
//       "Points": [
//         {
//           "PointID": 1,
//           "X": 0,
//           "Y": 0
//         },
//         {
//           "PointID": 2,
//           "X": 0,
//           "Y": 1480
//         },
//         {
//           "PointID": 3,
//           "X": 1230,
//           "Y": 0
//         },
//         {
//           "PointID": 4,
//           "X": 1230,
//           "Y": 1480
//         }
//       ],
//       "Members": [
//         {
//           "MemberID": 1,
//           "PointA": 1,
//           "PointB": 2,
//           "SectionID": 1,
//           "MemberType": 1,
//           "Length_cm": 0,
//           "TributaryArea": 0,
//           "TributaryAreaFactor": 0,
//           "Cp": 0
//         },
//         {
//           "MemberID": 2,
//           "PointA": 3,
//           "PointB": 4,
//           "SectionID": 1,
//           "MemberType": 1,
//           "Length_cm": 0,
//           "TributaryArea": 0,
//           "TributaryAreaFactor": 0,
//           "Cp": 0
//         },
//         {
//           "MemberID": 3,
//           "PointA": 1,
//           "PointB": 3,
//           "SectionID": 1,
//           "MemberType": 1,
//           "Length_cm": 0,
//           "TributaryArea": 0,
//           "TributaryAreaFactor": 0,
//           "Cp": 0
//         },
//         {
//           "MemberID": 4,
//           "PointA": 2,
//           "PointB": 4,
//           "SectionID": 1,
//           "MemberType": 1,
//           "Length_cm": 0,
//           "TributaryArea": 0,
//           "TributaryAreaFactor": 0,
//           "Cp": 0
//         }
//       ],
//       "Infills": [
//         {
//           "InfillID": 1,
//           "BoundingMembers": [
//             1,
//             4,
//             2,
//             3
//           ],
//           "GlazingSystemID": 1,
//           "PanelSystemID": -1,
//           "OperabilitySystemID": 1,
//           "GlazingBeadProfileArticleName": "184090",
//           "GlazingGasketArticleName": "284835",
//           "GlazingRebateGasketArticleName": "284321",
//           "GlazingRebateInsulationArticleName": "288429",
//           "HandlePosition": 800
//         }
//       ],
//       "SlabAnchors": null,
//       "Reinforcements": null,
//       "SpliceJoints": null,
//       "GlazingSystems": [
//         {
//           "GlazingSystemID": 1,
//           "Rw": 35,
//           "RwC": -1,
//           "RwCtr": -4,
//           "STC": 35,
//           "OITC": 30,
//           "SHGC": 0.39,
//           "VT": 0.7023,
//           "UValue": 1.358,
//           "SpacerType": 1,
//           "Description": "1/4 Clear+1/2 ARGON+1/4 Clear (1 in)",
//           "Plates": [
//             {
//               "Material": "glass",
//               "H": 6,
//               "InterMaterial": null,
//               "InterH": 0
//             },
//             {
//               "Material": "glass",
//               "H": 6,
//               "InterMaterial": null,
//               "InterH": 0
//             }
//           ],
//           "Cavities": [
//             {
//               "CavityType": "Argon",
//               "Lz": 12
//             }
//           ],
//           "Category": null,
//           "PSIValue": 0
//         }
//       ],
//       "OperabilitySystems": [
//         {
//           "OperabilitySystemID": 1,
//           "VentArticleName": "466470",
//           "VentInsideW": 56,
//           "VentOutsideW": 71,
//           "VentOpeningDirection": "Inward",
//           "VentOperableType": "Side-Hung-Left",
//           // "HandlePosition": 800
//         }
//       ],
//       "PanelSystems": [],
//       "Sections": [
//         {
//           "SectionID": 1,
//           "SectionType": 1,
//           "ArticleName": "486890",
//           "isCustomProfile": false
//         },
//         {
//           "SectionID": 2,
//           "SectionType": 2,
//           "ArticleName": "382280",
//           "isCustomProfile": false
//         },
//         {
//           "SectionID": 3,
//           "SectionType": 3,
//           "ArticleName": "382280",
//           "isCustomProfile": false,
//         }
//       ],
//       "FacadeSections": null,
//       "CustomGlass": null
//     },
//     "Acoustic": null,
//     "Structural": {
//       "DispIndexType": 1,
//       "DispHorizontalIndex": 0,
//       "DispVerticalIndex": 0,
//       "WindLoadInputType": 1,
//       "dinWindLoadInput": null,
//       "WindLoad": 0.96,
//       "Cpp": 1,
//       "Cpn": -1,
//       "HorizontalLiveLoad": 0,
//       "HorizontalLiveLoadHeight": 0,
//       "LoadFactor": null,
//       "SeasonFactor": null,
//       "TemperatureChange": null,
//       "ShowBoundaryCondition": false,
//       "ShowWindPressure": false,
//       "PositiveWindPressure": null,
//       "NegativeWindPressure": null
//     },
//     "Thermal": null,
//     "ExtendedData": {
//       "Hardwares": [
//         {
//           "HardwareID": 1,
//           "HardwareAlloy": "7075-T6",
//           "HardwareFy": 180.0,
//           "HardwareFu": 29.0,
//           "HardwareFinishes": "Silver"
//         }
//       ],
//       "MachiningInfo": {
//         "GlueHoleOffsetsfromLeftTopCorner": 22.0,
//         "NailHoleOffsetsfromLeftTopCorner": 44.0
//       }
//     },
//   },
//   "AnalysisResult": null,
//   "CollapsedPanels": {
//     "Panel_Configure": true,
//     "Panel_Operability": false,
//     "Panel_Framing": false,
//     "Panel_Glass": false,
//     "Panel_Acoustic": false,
//     "Panel_Structural": false,
//     "Panel_Thermal": false
//   }
// }



// This is the default unified model for door
const MockData =
{
  "UserSetting":
  {
      "Language": "en-US",
      "UserName": "Designer",
      "ApplicationType": "BPS"
  },
  "ProblemSetting":
  {

      "UserGuid": "00000000-0000-0000-0000-000000000000",
      "ProjectGuid": "00000000-0000-0000-0000-000000000000",
      "ProblemGuid": "00000000-0000-0000-0000-000000000000",
      "EnableAcoustic": false,
      "EnableStructural": false,
      "EnableThermal": false,
      "ProductType": null,
      "FacadeType": null,
      "ProjectName": null,
      "Location": null,
      "ConfigurationName": "DEFAULT-SlidingDoor-Type-2A-Left",
      "UserNotes": "",
      "Client": null,
      "ProjectNumber": null,
      "LastModifiedDate": null,
      "DrawingNames": null,
      "isAcousticEnabled": false
  },
  "SRSProblemSetting":
  {
      "isOrderPlaced": false,
      "OrderNumber": null,
      "SubTotal": 0,
      "Quantity": 0,
      "Client": null,
      "ProjectNumber": null,
      "LastModifiedDate": null,
      "DrawingNames": null,
      "QuickCheckPassed": true
  },
  "UnifiedModelVersion": "V2",
  "ModelInput":
  {
      "FrameSystem":
      {
          "SystemType": "ASE 60",
          "UvalueType": "AIF",
          "InsulationType": "Polyamide Anodized After",
          "InsulatingBarDataNote": null,
          "InsulationMaterial": "8",
          "Alloys": "6060-T66 (150MPa)",
          "xNumberOfPanels": 0,
          "yNumberOfPanels": 0,
          "MajorMullionTopRecess": 0,
          "MajorMullionBottomRecess": 0,
          "VerticalJointWidth": 0,
          "HorizontalJointWidth": 0,
          "AluminumFinish": "Anodized",
          "AluminumColor": "Silver grey - RAL 7001",
          "InsulationZone": null
      },
      "Geometry":
      {
          "Points": [
          {
              "PointID": 1,
              "X": 0,
              "Y": 0
          },
          {
              "PointID": 2,
              "X": 0,
              "Y": 2500
          },
          {
              "PointID": 3,
              "X": 3000,
              "Y": 0
          },
          {
              "PointID": 4,
              "X": 3000,
              "Y": 2500
          }],
          "Members": [
          {
              "MemberID": 1,
              "PointA": 1,
              "PointB": 2,
              "SectionID": 41,
              "MemberType": 1,
              "Length_cm": 0,
              "TributaryArea": 0,
              "TributaryAreaFactor": 0,
              "Cp": 0
          },
          {
              "MemberID": 2,
              "PointA": 3,
              "PointB": 4,
              "SectionID": 41,
              "MemberType": 1,
              "Length_cm": 0,
              "TributaryArea": 0,
              "TributaryAreaFactor": 0,
              "Cp": 0
          },
          {
              "MemberID": 3,
              "PointA": 1,
              "PointB": 3,
              "SectionID": 45, 
              "MemberType": 1,
              "Length_cm": 0,
              "TributaryArea": 0,
              "TributaryAreaFactor": 0,
              "Cp": 0
          },
          {
              "MemberID": 4,
              "PointA": 2,
              "PointB": 4,
              "SectionID": 41,
              "MemberType": 1,
              "Length_cm": 0,
              "TributaryArea": 0,
              "TributaryAreaFactor": 0,
              "Cp": 0
          }],
          "Infills": [
          {
              "InfillID": 1,
              "BoundingMembers": [
                  1,
                  4,
                  2,
                  3
              ],
              "GlazingSystemID": 1,
              "PanelSystemID": -1,
              "OperabilitySystemID": 1,
              "BlockDistance": 150,
              "VentWeight": 0,
              "LockingPointOption": 0,
              "HandlePosition": 0,
              "InsertOuterFrameDepth": 0,
              "InsertWindowSystem": null,
              "InsertWindowSystemType": null,
              "GlazingBeadProfileArticleName": null,
              "GlazingGasketArticleName": null,
              "GlazingRebateGasketArticleName": null,
              "GlazingRebateInsulationArticleName": null
          }],
          "GlazingSystems": [
          {
              "Manufacturer": null,
              "BrandName": null,
              "GlazingSystemID": 1,
              "Color": null,
              "Rw": 31,
              "RwC": 0,
              "RwCtr": 0,
              "STC": 0,
              "OITC": 0,
              "UValue": 1.1,
              "SHGC": 0,
              "VT": 0,
              "SpacerType": 1,
              "Description": "1/4 Clear SB 60+1/2 ARGON+1/4 Clear (1 in)",
              "Plates": [
              {
                  "Material": "glass",
                  "H": 6,
                  "InterMaterial": null,
                  "InterH": 0
              },
              {
                  "Material": "glass",
                  "H": 6,
                  "InterMaterial": null,
                  "InterH": 0
              }],
              "Cavities": [
              {
                  "CavityType": "Argon",
                  "Lz": 12
              }],
              "Category": null,
              "PSIValue": 0
          }],
          "PanelSystems": [],
          "OperabilitySystems": [
          {
              "OperabilitySystemID": 1,
              "SlidingDoorSystemID": 1,
              "VentArticleName": null,
              "VentInsideW": 0.0,
              "VentOutsideW": 0.0,
              "VentDistBetweenIsoBars": 0.0,
              "JunctionType": 0,
              "InsertedWindowType": null,
              "InsertOuterFrameArticleName": null,
              "InsertOuterFrameInsideW": 0.0,
              "InsertOuterFrameOutsideW": 0.0,
              "InsertOuterFrameDistBetweenIsoBars": 0.0,
              "InsertUvalueType": null,
              "InsertInsulationType": null,
              "VentOpeningDirection": null,
              "VentOperableType": "SlidingDoor-Type-2A-Left",   
              "RebateGasketArticleName": null,
              "CenterGasketInsulationArticleName": null,
              "InsideHandleArticleName": null,
              "HandleColor": null,
              "InsertOuterFrameDepth": 0.0,
              "InsertWindowSystem": null
          }],
          "SlidingDoorSystems": [
          {
              "SlidingDoorSystemID": 1,
              "InsideHandleArticleName": "269411", 
              "InsideHandleColor": "Silver grey - RAL 7001",
              "OutsideHandleArticleName": "269400", 
              "OutsideHandleColor": "Silver grey - RAL 7001",
              "SlidingDoorSystemType": "ASE 60", 
              "SlidingOperabilityType": "Lift_And_Slide",
              "SlidingVentSectionID": 43,
              "SlidingVentInterlockSectionID": 42,
              "InterlockReinforcement": false,
              "StructuralProfileArticleName": "513000",
              "SteelTubeArticleName": null, 
              "DoubleVentArticleName": null,
              "VentFrames": [ 
                  {
                      "VentFrameID": 1, 
                      "Width": 1500, 
                      "Type": "Sliding",
                      "Track": 1
                  },
                  {
                      "VentFrameID": 2,
                      "Width": 1500,
                      "Type": "Sliding",
                      "Track": 2
                  }
                  
              ]
          }],
          "SlabAnchors": null,
          "SpliceJoints": null,
          "Reinforcements": null,
          "Sections": [
              {
                  "SectionID": 41,
                  "SectionType": 41,
                  "ArticleName": "487850",
                  "InsideW": 48,
                  "OutsideW": 48,
                  "Depth": -140
              },
              {
                  "SectionID": 45,
                  "SectionType": 45, 
                  "ArticleName": "487850",
                  "InsideW": 48,
                  "OutsideW": 48,
                  "Depth": -140
              },
              {
                  "SectionID": 43,
                  "SectionType": 43, 
                  "ArticleName": "490080",
                  "InsideW": 60,
                  "OutsideW": 82,
                  "Depth": -60

              },
              {
                  "SectionID": 42,
                  "SectionType": 42, 
                  "ArticleName": "490080",
                  "InsideW": 60,
                  "OutsideW": 82,
                  "Depth": -60
              }

          ],
          "FacadeSections": null,
          "CustomGlass": null
      },
      "Acoustic": null,
      "Structural": null, 
      "Thermal": null,
      "SRSExtendedData": null
  },
  "AnalysisResult": null,
  "CollapsedPanels":
  {
      "Panel_Configure": false,
      "Panel_Operability": false,
      "Panel_Framing": false,
      "Panel_Glass": false,
      "Panel_Acoustic": false,
      "Panel_Structural": false,
      "Panel_Thermal": false,
      "Panel_Load": false
  }
}