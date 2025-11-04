import { login } from '../../../services/auth.request';
import { areaVcm, designBaseVolume, elevationVcm, volumeVcm, distanceVcm, ElevationProfileVcm, sbvc } from '../../../services/vcm.request';
import { test, expect } from '../../../test-options';
import { STATUS_CODES } from '../../../utils/statusCodes';

test.describe('VCM Test', () => {
    let token: string;
    test.beforeEach(async ({ request }) => {
        const email: string = process.env.EMAIL || '';
        const password: string = process.env.PASSWORD || '';

        const loginResponse = await login(request, email, password);
        expect(loginResponse.status()).toBe(STATUS_CODES.SUCCESS.CREATED);

        const loginResponseBody = await loginResponse.json();
        token = loginResponseBody.data.attributes.token;

    });

    test('should return 200 and the correct data for a valid VCM Elevation request', async ({ request }) => {
        const getElevationResponse = await elevationVcm(request, token, '69794', '127.12995962492273', '37.1378049701908');
        expect(getElevationResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const elevationResponseBody = await getElevationResponse.json();
        const actualUnit = elevationResponseBody.unit;
        expect(actualUnit).toBe('m');
        const actualValue = elevationResponseBody.value;
        expect(actualValue).toBe(75.47);
    });

    test('should return 200 and the correct data for a design base volume dbvc', async ({ request }) => {
        const designBaseVolumeResponse = await designBaseVolume(request, token, '69794');
        expect(designBaseVolumeResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const designBaseVolumeResponseBody = await designBaseVolumeResponse.json();
       
        // validate base plane
        const basePlane = designBaseVolumeResponseBody.basePlane;
        expect(basePlane).toBe('comparison');

        // validate cut value
        const cut = designBaseVolumeResponseBody.cut;
        expect(cut).toBe("61203");

        // validate elevation
        const elevation = designBaseVolumeResponseBody.elevation;
        expect(elevation).toBe("0.0");

        //validate fill value
        const fill = designBaseVolumeResponseBody.fill;
        expect(fill).toBe("0");

        //validate minMaxElevation
        const minMaxElevation = designBaseVolumeResponseBody.minMaxElevation;
        
        const maxHeight = minMaxElevation.maxHeight;
        expect(maxHeight).toBe(94.136791229248);
        
        const minHeight = minMaxElevation.minHeight;
        expect(minHeight).toBe(0.99481201171875);

        //validate volume
        const volume = designBaseVolumeResponseBody.volume;
        expect(volume).toBe("61203");

        //validate status
        const status = designBaseVolumeResponseBody.status;
        expect(status).toBe("200");

        //validate wmsInfo
        const wmsInfo = designBaseVolumeResponseBody.wmsInfo;
        expect(wmsInfo).toBeDefined();
        expect(wmsInfo.layer).toBe("designbased:69814-2025_09_12T09_33_54_095Z-69800-69794");
        expect(wmsInfo.url).toBe("https://geoserver-staging.angelswing.io/geoserver/designbased/wms");
        
        //validate nativeBoundingBox
        const nativeBoundingBox = wmsInfo.nativeBoundingBox;
        expect(nativeBoundingBox).toBeDefined();
        expect(nativeBoundingBox.crs.$).toBe("EPSG:5186");
        expect(nativeBoundingBox.crs["@class"]).toBe("projected");
        expect(nativeBoundingBox.maxx).toBe(211551.70662327492);
        expect(nativeBoundingBox.maxy).toBe(504384.2838413965);
        expect(nativeBoundingBox.minx).toBe(211449.70662327492);
        expect(nativeBoundingBox.miny).toBe(504293.2838413965);

        
    });

    test('should return 200 and the correct data for a valid VCM Volume request', async ({ request }) => {
        const volumeResponse = await volumeVcm(request, token, '69794');
        expect(volumeResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const volumeResponseBody = await volumeResponse.json();
        
        // validate base plane
        const basePlane = volumeResponseBody.basePlane;
        expect(basePlane).toBe('triangulation');

        //validate elevation
        const elevation = volumeResponseBody.elevation;
        expect(elevation).toBe(0.0);

        //validate the cut value
        const cut = volumeResponseBody.cut;
        expect(cut).toBe(20);

        //validate the fill value
        const fill = volumeResponseBody.fill;
        expect(fill).toBe(-616);

        //validate the status
        const status = volumeResponseBody.status;
        expect(status).toBe("200");
        
        //validate the volume
        const volume = volumeResponseBody.volume;
        expect(volume).toBe(-597);      
    });

    test('should return 200 and the correct data for a valid VCM Area request', async ({ request }) => {
        const areaResponse = await areaVcm(request, token, '69794');
        expect(areaResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const areaResponseBody = await areaResponse.json();

        //validate the surface area
        const actualValue = areaResponseBody.surface;
        expect(actualValue).toBe(717.9802078334026);
    });

    test('should return 200 and the correct data for a valid VCM distance request', async ({ request }) => {
        const distanceResponse = await distanceVcm(request, token, '69794');
        expect(distanceResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const distanceResponseBody = await distanceResponse.json();
        
        //validate the distance values
        const distanceValue = distanceResponseBody.distances;
        expect(distanceValue[0]).toBe(12.026891743323308);
        expect(distanceValue[1]).toBe(3.8440719196268134);
        expect(distanceValue[2]).toBe(9.194984311498);
    });

    test('should return 200 and the correct data for a valid VCM Elevation Profile request', async ({ request }) => {
        const elevationProfileResponse = await ElevationProfileVcm(request, token, '69794');
        expect(elevationProfileResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const elevationProfileResponseBody = await elevationProfileResponse.json();

        // Validate the elevation profile response structure
        const elevations = elevationProfileResponseBody.elevations;
        expect(elevations).toBeDefined();
        expect(Array.isArray(elevations)).toBe(true);
        expect(elevations.length).toBe(104);

        // Validate first elevation point
        const firstPoint = elevations[0];
        expect(firstPoint.alt).toBe(56.36);
        expect(firstPoint.dist).toBe(0.0);
        expect(firstPoint.lat).toBe(37.137078043);
        expect(firstPoint.lon).toBe(127.128403484);

        // Validate second elevation point
        const secondPoint = elevations[10];
        expect(secondPoint.alt).toBe(56.28);
        expect(secondPoint.dist).toBe(2.5);
        expect(secondPoint.lat).toBe(37.137069118);
        expect(secondPoint.lon).toBe(127.12842937);

        // Validate third elevation point
        const thirdPoint = elevations[33];
        expect(thirdPoint.alt).toBe(56.09);
        expect(thirdPoint.dist).toBe(8.25);
        expect(thirdPoint.lat).toBe( 37.137048592);
        expect(thirdPoint.lon).toBe(127.128488908);

        // Validate fourth elevation point
        const fourthPoint = elevations[59];
        expect(fourthPoint.alt).toBe(55.85);
        expect(fourthPoint.dist).toBe(14.49);
        expect(fourthPoint.lat).toBe(37.137017886);
        expect(fourthPoint.lon).toBe(127.128509685);

        // Validate fifth elevation point
        const fifthPoint = elevations[83];
        expect(fifthPoint.alt).toBe(55.59);
        expect(fifthPoint.dist).toBe(20.07);
        expect(fifthPoint.lat).toBe(37.136979495);
        expect(fifthPoint.lon).toBe(127.128531174);

        // Validate sixth elevation point
        const sixthPoint = elevations[103];
        expect(sixthPoint.alt).toBe(55.28);
        expect(sixthPoint.dist).toBe(24.97);
        expect(sixthPoint.lat).toBe(37.136945879);
        expect(sixthPoint.lon).toBe(127.128566972);
    });

    test('should return 200 and the correct data for a valid VCM sbvc request', async ({ request }) => {
        const sbvcResponse = await sbvc(request, token, '69794');
        expect(sbvcResponse.status()).toBe(STATUS_CODES.SUCCESS.OK);
        const sbvcResponseBody = await sbvcResponse.json();
       
         // validate base plane
         const basePlane = sbvcResponseBody.basePlane;
         expect(basePlane).toBe('comparison');
 
         // validate cut value
         const cut = sbvcResponseBody.cut;
         expect(cut).toBe("245");
 
         // validate elevation
         const elevation = sbvcResponseBody.elevation;
         expect(elevation).toBe("0.0");
 
         //validate fill value
         const fill = sbvcResponseBody.fill;
         expect(fill).toBe("-75");
 
         //validate minMaxElevation
         const minMaxElevation = sbvcResponseBody.minMaxElevation;
         
         const maxHeight = minMaxElevation.maxHeight;
         expect(maxHeight).toBe(8.5081329345703);
         
         const minHeight = minMaxElevation.minHeight;
         expect(minHeight).toBe(-9.4442558288574);
 
         //validate volume
         const volume = sbvcResponseBody.volume;
         expect(volume).toBe("170");
 
         //validate status
         const status = sbvcResponseBody.status;
         expect(status).toBe("200");
 
         //validate wmsInfo
         const wmsInfo = sbvcResponseBody.wmsInfo;
         expect(wmsInfo).toBeDefined();
         expect(wmsInfo.layer).toBe("surveybased:69833-2025_09_15T08_46_32_190Z-69794-69827");
         expect(wmsInfo.url).toBe("https://geoserver-staging.angelswing.io/geoserver/surveybased/wms");
         
         //validate nativeBoundingBox
         const nativeBoundingBox = wmsInfo.nativeBoundingBox;
         expect(nativeBoundingBox).toBeDefined();
         expect(nativeBoundingBox.crs.$).toBe("EPSG:5186");
         expect(nativeBoundingBox.crs["@class"]).toBe("projected");
         expect(nativeBoundingBox.maxx).toBe(211596.2042881811);
         expect(nativeBoundingBox.maxy).toBe(504204.5293324786);
         expect(nativeBoundingBox.minx).toBe(211559.2042881811);
         expect(nativeBoundingBox.miny).toBe(504163.0293324786);
    });
});