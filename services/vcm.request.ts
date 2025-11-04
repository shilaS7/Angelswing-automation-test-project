import { expect, APIResponse } from '@playwright/test';
import { ENDPOINTS } from '../utils/endpoints';

export async function elevationVcm(request: any, token: string, contentId: string, lon: string, lat: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION}/elev/${contentId}?lon=${lon}&lat=${lat}`, {
       
        headers: {
            'Authorization': `Bearer ${token}`,
            'content-type': 'application/json',
        },
    });
    return response;
}
export async function areaVcm(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/contents/${contentId}`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "type": "surface",
            "locations": [
                [
                    127.13051222511723,
                    37.138802886939885
                ],
                [
                    127.13084848249892,
                    37.13865610166822
                ],
                [
                    127.1307933154436,
                    37.13847366813137
                ],
                [
                    127.13040451766564,
                    37.13865819858036
                ]
            ]
        }
    });
    return response;
}

export async function designBaseVolume(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/dbvc/${contentId}`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "designDxfId": 69800,
            "volumeContentId": 69814,
            "locationsUpdatedAt": "2025-09-12T09:33:54.095Z",
            "wkt": "POLYGON ((14151952.520229846 4458420.6362139685,14151939.6696033 4458414.362486548,14151920.44865241 4458329.771316237,14151952.371890534 4458311.1686177235,14151955.504932543 4458311.793457376,14151964.580602987 4458306.118949545,14152028.19186732 4458326.478221879,14152026.633482678 4458332.142470996,14152027.262492627 4458334.028976901,14152029.460172325 4458337.800698505,14152031.964215534 4458336.539010363,14152048.29154489 4458365.770844289,14151958.468039373 4458418.111569424,14151952.520229846 4458420.6362139685))",
            "tf_wkts": [],
            "tf_methods": [],
            "basePlane": "custom",
            "elevation": 0,
            "demType": "dsm"
        }
           
    });
    return response;
}

export async function volumeVcm(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/vc/${contentId}`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "wkt": "POLYGON ((14152074.418901017 4458423.176645218,14152087.966208199 4458447.314643733,14152129.997561915 4458424.044918734,14152114.887105376 4458398.864993908,14152074.418901017 4458423.176645218))",
            "basePlane": "triangulation",
            "elevation": 0,
            "profile_type": "dsm"
        }
    });
    return response;
}

export async function distanceVcm(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/contents/${contentId}/length`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "type": "surface",
            "points": [
                [
                    127.12840348439572,
                    37.137078042535876
                ],
                [
                    127.12852759219913,
                    37.13703525569949
                ],
                [
                    127.12850014524135,
                    37.13700863276394
                ],
                [
                    127.12856697249995,
                    37.136945878662644
                ]
            ]
        }
    });
    return response;
}

export async function ElevationProfileVcm(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/elev-prof/${contentId}`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "wkt": "LINESTRING (127.12840348439572 37.137078042535876,127.12852759219913 37.13703525569949,127.12850014524135 37.13700863276394,127.12856697249995 37.136945878662644)",
            "profile_type": "dsm"
        }
    });
    return response;
}

export async function sbvc(request: any, token: string, contentId: string): Promise<APIResponse> {

    const response = await request.post(`${process.env.VCM_ELEVATION_HTTPS}/sbvc/${contentId}`, {
      
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Host': 'volume-dev.angelswing.io',
            'Content-Length': '382',

        },
        data:{
            "previousDsmId": 69827,
            "volumeContentId": 69833,
            "locationsUpdatedAt": "2025-09-15T08:46:32.190Z",
            "wkt": "POLYGON ((14152101.636635017 4458194.466833526,14152057.226025172 4458161.340852097,14152075.066271469 4458141.878765225,14152103.989095015 4458180.802938971,14152101.636635017 4458194.466833526))",
            "tf_wkts": [],
            "basePlane": "custom",
            "elevation": 0,
            "tf_methods": []
        }
           
    });
    return response;
}