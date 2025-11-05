import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { BrowserContext, Page } from '@playwright/test';
import { UI_META } from '../../utils/uiMeta';
import path from 'path';
import fs from 'fs';
import { countries, purpose } from '../../test-data/signup-test-data';
import { PhotoGallery } from '../../pages/PhotoGallery';

// test.use({ storageState: { cookies: [], origins: [] } });
test.use({
        launchOptions: {
            slowMo: 500,
        },
    });
test.describe('Photo Gallery Page', () => {

    let pm: PageManager;
    let helper: HelperBase;
    let context: BrowserContext;
    let page: Page;
    const albumName = faker.word.adjective() + " " + faker.word.noun();

    let name: string;

    test.beforeAll(async ({ page }, testInfo) => {

        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await pm.onDashboardPage.closeReadUserGuidePopUp();
        await pm.onDashboardPage.openProject('1575')
        // await pm.onLoginPage.openLoginPage();
        // await pm.onLoginPage.login(process.env.EMAIL || '', process.env.PASSWORD || '');
        // const loggedInUserResponse = await pm.onDashboardPage.getAuthAndCurrentUserResponse();
        // const userDetails = loggedInUserResponse.signinBody.data.attributes;
        // await helper.waitForNumberOfSeconds(2);
        // name = `${userDetails.firstName} ${userDetails.lastName}`;

        // await pm.onDashboardPage.closeReadUserGuidePopUp();
        // await pm.onDashboardPage.clickOnProjectMenu();
        // // await pm.onDashboardPage.openProject();
        // await pm.getPage.waitForTimeout(2000);
        const photoGalleryPage = pm.onPhotoGallery;

        //Navigate to the photo album page
        await pm.onProjectSidebarPage.clickOnPhotoAlbum();
    });

    test('should validate header of the photo album page', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        expect(await photoGalleryPage.getHeaderText()).toBe(UI_META.photoGalleryPage.header);
    });

    test('should show tabs as selected when user click on them', async () => {
        const photoGalleryPage = pm.onPhotoGallery;

        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        //Click on location tab 
        await photoGalleryPage.clickOnLocationTab();
        expect(await photoGalleryPage.isLocationTabShownAsSelected()).toBe(true);

        //Click on album tab
        await photoGalleryPage.clickOnAlbumTab();
        expect(await photoGalleryPage.isAlbumTabShownAsSelected()).toBe(true);


    });

    test('should validate the filter in timeline tab is working correctly', async () => {
        await helper.waitForNumberOfSeconds(5);
        const photoGalleryPage = pm.onPhotoGallery;
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        //Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        
        //Select All option
        await photoGalleryPage.clickAllOption();

        //  Select the "Flight Video" filter
        await photoGalleryPage.clickFilterFlightVideo();
        expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.flightVideo);
        await photoGalleryPage.clickFilterFlightVideo();

        //Select the "Birdeye" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilterBirdeye();
        expect(await photoGalleryPage.getFilterTextBirdeye()).toBe(UI_META.photoGalleryPage.filter.birdEyeView);
        await photoGalleryPage.clickFilterBirdeye()
        // expect(await photoGalleryPage.isBirdeyeFilterShownAsSelected()).toBe(true);

        //Select the "Inspection" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilterInspection();
        expect(await photoGalleryPage.getFilterTextInspection()).toBe(UI_META.photoGalleryPage.filter.inspectionPhoto);
        await photoGalleryPage.clickFilterInspection();

        //Select the "Source Photo" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilterSourcePhoto();
        expect(await photoGalleryPage.getFilterTextSourcePhoto()).toBe(UI_META.photoGalleryPage.filter.sourcePhotos);
        await photoGalleryPage.clickFilterSourcePhoto();

        //Select the "360 Photos" filter
        // await photoGalleryPage.clickFilterAll();
        // await photoGalleryPage.clickFilter360Photos();
        // expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.ThreeSixtyPhotos);
        // await photoGalleryPage.clickFilter360Photos();

        //Select the "360 Source Photo" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickfilter360SourcePhoto();
        expect(await photoGalleryPage.getFilterText360SourcePhoto()).toBe(UI_META.photoGalleryPage.filter.threeSixtySourcePhotos);
        await photoGalleryPage.clickfilter360SourcePhoto();

         //Select the "Requested Photos" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickfilterRequestedPhotos();
        expect(await photoGalleryPage.getFilterTextRequestedPhotos()).toBe(UI_META.photoGalleryPage.filter.requestedPhotos);
        await photoGalleryPage.clickfilterRequestedPhotos();

        //369 panorama images
        await photoGalleryPage.clickFilter360PanoramaImages();
        expect(await photoGalleryPage.getFilterText360PanoramaImages()).toBe(UI_META.photoGalleryPage.filter.threeSixtyPanoramaImages);
        await photoGalleryPage.clickFilter360PanoramaImages();

        // //Select the "360 Indoor Videos" filter
        // // await photoGalleryPage.clickFilterAll();
        // await photoGalleryPage.clickFilter360Video();
        // expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.ThreeSixtyIndoorVideos);
        // await photoGalleryPage.clickFilter360Video();


        //Select the "360 VSLAM Photos" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilter360Indoor();
        expect(await photoGalleryPage.getFilterText360Indoor()).toBe(UI_META.photoGalleryPage.filter.threeSixtyIndoor);
        await photoGalleryPage.clickFilter360Indoor();

        //Select the "360 Stitched Photos" filter
        // await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilter360StitchedPhotos();
        expect(await photoGalleryPage.getFilterText360StitchedPhotos()).toBe(UI_META.photoGalleryPage.filter.threeSixtyStitchedPhotos);
    });

    test('should validate the filter in location tab is working correctly', async () => {
        const photoGalleryPage = pm.onPhotoGallery;

        // Go to the location tab
        await photoGalleryPage.clickOnLocationTab();
        expect(await photoGalleryPage.isLocationTabShownAsSelected()).toBe(true);

        //Select the "Bird Eye View" filter
        await photoGalleryPage.clickFilterIcon();
        expect(await photoGalleryPage.getFilterTextLocationBirdeye()).toBe(UI_META.photoGalleryPage.locationFilters.birdEyeView);
        await photoGalleryPage.page.click('body');
        
       // Select the Source Photos filter
        await photoGalleryPage.clickFilterIcon();
        await photoGalleryPage.clickFilterLocationSource();
        await helper.waitForNumberOfSeconds(2);
        expect(await photoGalleryPage.getFilterTextLocationFilterSource()).toBe(UI_META.photoGalleryPage.locationFilters.sourcePhotos);   
    

        // await photoGalleryPage.page.click('body');

        //Select the Inspection Photos filter
        await photoGalleryPage.clickFilterIcon();   
        await photoGalleryPage.clickFilterLocationInspection();
        expect(await photoGalleryPage.getFilterTextLocationFilterInspection()).toBe(UI_META.photoGalleryPage.locationFilters.inspectionPhoto);
        await helper.waitForNumberOfSeconds(2);
    
      

    });

    test('should validate the filter in album tab is working correctly', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        //Go to the album tab
        await photoGalleryPage.clickOnAlbumTab();
        expect(await photoGalleryPage.isAlbumTabShownAsSelected()).toBe(true);
        await photoGalleryPage.clickFilterIconAlbum();

        //select all  option
        // await photoGalleryPage.clickAllbutton();
        // expect(await photoGalleryPage.isAllOptionAlbumShownAsSelected()).toBe(true);
    
        //Select the "Birdeye" filter
        await photoGalleryPage.clickAllOptionAlbum();
        await photoGalleryPage.clickFilterAlbumBirdeye();
        expect(await photoGalleryPage.getFilterTextAlbumBirdeye()).toBe(UI_META.photoGalleryPage.filter.birdEyeView);
        await photoGalleryPage.clickFilterAlbumBirdeye();
  
        //Select the "Inspection" filter
        await photoGalleryPage.clickFilterAlbumInspection();
        expect(await photoGalleryPage.getFilterTextAlbumInspection()).toBe(UI_META.photoGalleryPage.filter.inspectionPhoto);
        await photoGalleryPage.clickFilterAlbumInspection();

        //Select the "Source Photo" filter
        await photoGalleryPage.clickFilterAlbumSourcePhoto();
        expect(await photoGalleryPage.getFilterTextAlbumSourcePhoto()).toBe(UI_META.photoGalleryPage.filter.sourcePhotos);
        await photoGalleryPage.clickFilterAlbumSourcePhoto();

        //Select the "360 Source Photo" filter
        await photoGalleryPage.clickFilterAlbum360SourcePhoto();
        expect(await photoGalleryPage.getFilterTextAlbum360SourcePhoto()).toBe(UI_META.photoGalleryPage.filter.threeSixtySourcePhotos);
        await photoGalleryPage.clickFilterAlbum360SourcePhoto();

        //Select the "Requested Photos" filter
        await photoGalleryPage.clickFilterAlbumRequestedPhotos();
        expect(await photoGalleryPage.getFilterTextAlbumRequestedPhotos()).toBe(UI_META.photoGalleryPage.filter.requestedPhotos);
        await photoGalleryPage.clickFilterAlbumRequestedPhotos();

        //Select the "Stitched Photos" filter
        await photoGalleryPage.clickFilterAlbum360StitchedPhotos();
        expect(await photoGalleryPage.getFilterText360StitchedPhotosAlbum()).toBe(UI_META.photoGalleryPage.filter.threeSixtyStitchedPhotos);
        await photoGalleryPage.clickFilterAlbum360StitchedPhotos();

        //Select the "360 panorama images" filter
        await photoGalleryPage.clickFilterAlbum360PanoramaImages();
        expect(await photoGalleryPage.getFilterText360PanoramaImagesAlbum()).toBe(UI_META.photoGalleryPage.filter.threeSixtyPanoramaImages);
        await photoGalleryPage.clickFilterAlbum360PanoramaImages();

       
        //Select the "360 VSLAM Photos" filter
        await photoGalleryPage.clickFilterAlbum360Indoor();
        expect(await photoGalleryPage.getFilterText360IndoorAlbum()).toBe(UI_META.photoGalleryPage.filter.threeSixtyIndoor);
       });

    //flight video selection test
    test('should validate flight video on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");

        //Select the "Flight Video" filter
        await photoGalleryPage.clickFilterFlightVideo();
        expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.flightVideo);
        console.log("flight video filter is selected");

        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);
        console.log("filter dropdown is closed by clicking body element");

        // Click on the first photo available on the timeline tab
        await pm.onMapPage.clickOn3D();
        await pm.on3DMap.verify3DMapIsVisible();
        console.log("3d map is visible");

        //Close the filter dropdown using the dedicated method
        // await photoGalleryPage.closeFilterDropdown();
        // console.log("filter dropdown is closed using dedicated method");

        //Click on the first video available on the timeline tab
        await photoGalleryPage.clickOnPhotoVideo();

    });

    //bird eye photo selection test
    test('should validate the bird eye photo on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        await helper.waitForNumberOfSeconds(5);
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
        console.log("timeline tab is selected");
       
        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");
   
        //Select the "Birdeye" filter
        await photoGalleryPage.clickFilterBirdeye();
        expect(await photoGalleryPage.getFilterTextBirdeye()).toBe(UI_META.photoGalleryPage.filter.birdEyeView);
        console.log("birdeye filter is selected");
        
        // Close the filter by clicking outside     
        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);


        // Click on the first photo available on the timeline tab
            await pm.onMapPage.clickOn3D();
            await pm.on3DMap.verify3DMapIsVisible();
            console.log("3d map is visible");
       

        // await photoGalleryPage.clickFilterAll();

        // await photoGalleryPage.clickFilterBirdeye();
        // expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.birdEyeView);

        //Click on the first photo available on the timeline tab
        // await pm.onMapPage.clickOn3D();
        // await pm.on3DMap.verify3DMapIsVisible();

        await photoGalleryPage.clickOnPhoto();

        // Assert the photo is selected 
        expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);
        console.log("photo is selected");

    });

    //inspection photo selection test
    test('should validate the inspection photo on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;

        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");

        //Select the "inspection" filter
        
        await photoGalleryPage.clickFilterInspection();
        expect(await photoGalleryPage. getFilterTextInspection()).toBe(UI_META.photoGalleryPage.filter.inspectionPhoto);

        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);

        //Click on the first photo available on the timeline tab
        await pm.onMapPage.clickOn3D();
        // await pm.on3DMap.verify3DMapIsVisible();
        await photoGalleryPage.clickPhotoInspectionAlbum();
        await photoGalleryPage.clickOnPhotoInspection();

        // Assert the photo is selected 
        expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);

    });

    //source photo selection test
    test('should validate the source photo on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        await helper.waitForNumberOfSeconds(5);
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
        console.log("timeline tab is selected");
       
        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");

        //Select the "Source Photo" filter
        await photoGalleryPage.clickFilterSourcePhoto();
        expect(await photoGalleryPage.getFilterTextSourcePhoto()).toBe(UI_META.photoGalleryPage.filter.sourcePhotos);

        // Close the filter by clicking outside     
        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);
        

        //Click on the first photo available on the timeline tab
        await pm.onMapPage.clickOn3D();
        await pm.on3DMap.verify3DMapIsVisible();
        await helper.waitForNumberOfSeconds(2);
        await photoGalleryPage.clickPhotoSourceAlbum();
        await photoGalleryPage.clickOnPhotoSource();
   
    });
    
    //360 source photo selection test
    test('should validate 360 source photo on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        await helper.waitForNumberOfSeconds(5);
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
        console.log("timeline tab is selected");
       
        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");
        
        //Select the "360 source photo" filter
        await photoGalleryPage.clickfilter360SourcePhoto();
        expect(await photoGalleryPage.getFilterText360SourcePhoto()).toBe(UI_META.photoGalleryPage.filter.threeSixtySourcePhotos);

        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);

        //Click on the first photo available on the timeline tab
        await pm.onMapPage.clickOn3D();
        // await pm.on3DMap.verify3DMapIsVisible();
        await photoGalleryPage.clickPhoto360SourceAlbum();
        await helper.waitForNumberOfSeconds(2);
        await photoGalleryPage.clickPhoto360Source();

        // Assert the photo is selected 
        expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);

    });

    //select the requested photos test
    test('should validate the requested photos on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
    });

    //select the 360 panorama images test
    test('should validate the 360 panorama images on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
         //Click on timeline tab
         await photoGalleryPage.clickOnTimelineTab();
         expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
         // Select the "All" filter
         await photoGalleryPage.clickFilterAll();
         expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
         console.log("all filter is selected");
         
         //Select All option
         await photoGalleryPage.clickAllOption();
          console.log("all option is selected");
 
         //Select the "360 panorama images" filter
         await photoGalleryPage.clickFilter360PanoramaImages();
         expect(await photoGalleryPage. getFilterText360PanoramaImages()).toBe(UI_META.photoGalleryPage.filter.threeSixtyPanoramaImages);
 
         await photoGalleryPage.page.click('body');
         await helper.waitForNumberOfSeconds(1);
 
         //Click on the first photo available on the timeline tab
         await pm.onMapPage.clickOn3D();
         // await pm.on3DMap.verify3DMapIsVisible();
         await photoGalleryPage.clickPhoto360PanoramaImagesAlbum();

        //  await photoGalleryPage.clickPhoto360PanoramaImages();
 
         // Assert the photo is selected 
         expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);
    });
    
    //select the 360 indoor
    test('should validate the 360 indoor on the gallery page is selected when user click on it', async () => {
        const photoGalleryPage = pm.onPhotoGallery;

        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        // Select the "All" filter
        await photoGalleryPage.clickFilterAll();
        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");

         //select the "360 indoor" filter
         await photoGalleryPage.clickFilter360Indoor();
         expect(await photoGalleryPage.getFilterText360Indoor()).toBe(UI_META.photoGalleryPage.filter.threeSixtyIndoor);

         await photoGalleryPage.page.click('body');
         await helper.waitForNumberOfSeconds(1);
 
         //Click on the first photo available on the timeline tab
         await pm.onMapPage.clickOn3D();
         await pm.on3DMap.verify3DMapIsVisible();
         await photoGalleryPage.clickPhoto360IndoorAlbum();
         await helper.waitForNumberOfSeconds(2);
         await photoGalleryPage.clickPhoto360Indoor();
         await helper.waitForNumberOfSeconds(3);
         //slide the toggle to open the indoor page
         await photoGalleryPage.slidetoggleIndoor();

        //  await photoGalleryPage.clickPhoto360PanoramaImages();
 
         // Assert the photo is selected 
         expect(await photoGalleryPage.getHeaderTextIndoor()).toBe(UI_META.photoGalleryPage.headerIndoor);
    });

    //360 stiched photo selection test
    test('should validate 360 stiched photo on the gallery page is selected when user click on it', async () => {
         const photoGalleryPage = pm.onPhotoGallery;
         //Click on timeline tab
         await photoGalleryPage.clickOnTimelineTab();
         expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
         // Select the "All" filter
         await photoGalleryPage.clickFilterAll();
         expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
         console.log("all filter is selected");
         
         //Select All option
         await photoGalleryPage.clickAllOption();
          console.log("all option is selected");

         //Select the "360" filter
        
         await photoGalleryPage.clickFilter360StitchedPhotos();
         expect(await photoGalleryPage.getFilterText360StitchedPhotos()).toBe(UI_META.photoGalleryPage.filter.threeSixtyStitchedPhotos);

         //Click on the first photo available on the timeline tab
        //  await pm.onMapPage.clickOn3D();
        //  await pm.on3DMap.verify3DMapIsVisible();
        //  await photoGalleryPage.clickPhotoAlbum();

        // //Assert the photo is selected 
        // expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);    
         
    })

    // test('should validate 360 VSLAM video on the gallery page is selected when user click on it', async () => {
    //     const photoGalleryPage = pm.onPhotoGallery;

    //      //Click on timeline tab
    //      await photoGalleryPage.clickOnTimelineTab();
    //      expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

    //      //Select the "360" filter
    //      await photoGalleryPage.clickFilterAll();
    //      await photoGalleryPage.clickFilter360Video();
    //      expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.ThreeSixtyIndoorVideos);

    //      //Click on the first photo available on the timeline tab
    //      await pm.onMapPage.clickOn3D();
    //     //  await pm.on3DMap.verify3DMapIsVisible();

    //      //click on the vslam album
    //      await photoGalleryPage.clickOnPhotoVslam();


    //     //Assert the photo is selected 
    //     expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);    
         
    // })

    // test('should validate 360 VSLAM photo on the gallery page is selected when user click on it', async () => {
    //     const photoGalleryPage = pm.onPhotoGallery;

    //      //Click on timeline tab
    //      await photoGalleryPage.clickOnTimelineTab();
    //      expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

    //      //Select the "360" filter
    //      await photoGalleryPage.clickFilterAll();
    //      await photoGalleryPage.clickFilter360Indoor();
    //      expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.ThreeSixtyIndoor);

    //      //Click on the first photo available on the timeline tab
    //      await pm.onMapPage.clickOn3D();
    //      await pm.on3DMap.verify3DMapIsVisible();

    //      //click on the vslam album
    //      await photoGalleryPage.clickOnPhotoVslam();

    //     // Assert the photo is selected 
    //     expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);    

    // })

    // test('should validate Requested photo on the gallery page is selected when user click on it', async () => {
    //     const photoGalleryPage = pm.onPhotoGallery;

    //      //Click on timeline tab
    //      await photoGalleryPage.clickOnTimelineTab();
    //      expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

    //      //Select the "360" filter
    //      await photoGalleryPage.clickFilterAll();
    //      await photoGalleryPage.clickfilterRequestedPhotos();
    //      expect(await photoGalleryPage.getFilterText()).toBe('Requested Photos');

    //      //Click on the first photo available on the timeline tab
    //      await pm.onMapPage.clickOn3D();
    //      await pm.on3DMap.verify3DMapIsVisible();
    //      await photoGalleryPage.clickPhotoAlbum();
    //      await photoGalleryPage.clickOnPhotoInspection();

    //     // Assert the photo is selected 
    //     expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);    

    // })

    test('should able to upload the bird eye photo from the gallery', async () => {
        
        const photoGalleryPage = pm.onPhotoGallery;
         //Click on timeline tab

        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        const fileChooserPromise = pm.getPage.waitForEvent('filechooser');
        await photoGalleryPage.uploadPhotoFromGallery();
        await photoGalleryPage.clickonUploadButtonFileChooser();
        const fileChooser = await fileChooserPromise;
        
        await helper.waitForNumberOfSeconds(2);
        const folderPath = 'D:/Automation Upload/Bird eye photo';
        await photoGalleryPage.handleFileChooserWithImages(fileChooser, folderPath);
        await photoGalleryPage.clickonUploadButtonPopup();
        await helper.waitForNumberOfSeconds(35);

        //Assert the success message is displayed
        expect(await photoGalleryPage.uploadSuccessMessage()).toContain('Successfully uploaded photos.');
        console.log(await photoGalleryPage.uploadSuccessMessage());

        //Close the popup
        await photoGalleryPage.isCloseButtonShown();
    })
   
    test('should able to upload the inspection photo from the gallery', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);

        //Select the "Inspection" filter
        await photoGalleryPage.clickFilterAll();
        await photoGalleryPage.clickFilterInspection();
        expect(await photoGalleryPage.getFilterText()).toBe(UI_META.photoGalleryPage.filter.inspectionPhoto);
        await photoGalleryPage.clickOnPhoto();

        const fileChooserPromise = pm.getPage.waitForEvent('filechooser');
        await photoGalleryPage.uploadPhotoFromGallery();
        await photoGalleryPage.clickonUploadButtonFileChooser();
        const fileChooser = await fileChooserPromise;
        
        await helper.waitForNumberOfSeconds(2);
        const folderPath = 'D:/Automation Upload/Bird eye photo';
        await photoGalleryPage.handleFileChooserWithImages(fileChooser, folderPath);
        await photoGalleryPage.clickonUploadButtonPopup();
        await helper.waitForNumberOfSeconds(20);

         //Assert the success message is displayed
         expect(await photoGalleryPage.uploadSuccessMessage()).toContain('Successfully uploaded photos.');

         //Close the popup
        await photoGalleryPage.isCloseButtonShown();

       
    })

    test('should able to add the photo on the album', async () => {
        const photoGalleryPage = pm.onPhotoGallery;
        //Click on timeline tab
        await photoGalleryPage.clickOnTimelineTab();
        expect(await photoGalleryPage.isTimelineTabShownAsSelected()).toBe(true);
        await photoGalleryPage.clickFilterAll();

        expect(await photoGalleryPage.isAllFilterShownAsSelected()).toBe(true);
        console.log("all filter is selected");
        
        //Select All option
        await photoGalleryPage.clickAllOption();
         console.log("all option is selected");
   
        //Select the "Birdeye" filter
        await photoGalleryPage.clickFilterBirdeye();
        expect(await photoGalleryPage.getFilterTextBirdeye()).toBe(UI_META.photoGalleryPage.filter.birdEyeView);
        console.log("birdeye filter is selected");
        
        await photoGalleryPage.page.click('body');
        await helper.waitForNumberOfSeconds(1);

        await pm.onMapPage.clickOn3D();
        await pm.on3DMap.verify3DMapIsVisible();
        console.log("3d map is visible");

        // select the photo
        await photoGalleryPage.clickOnPhoto();
        // Assert the photo is selected 
        expect(await photoGalleryPage.isAnyPhotoSelected()).toBe(true);
        console.log("photo is selected");

        //Select the album button
        await photoGalleryPage.clickAddToAlbumButton();
        expect(await photoGalleryPage.isAddToAlbumButtonShown()).toBe(true);

        //select the create album button
        await photoGalleryPage.clickCreateAlbumButton();
        await photoGalleryPage.isAlbumPlaceholderClicked();
        expect(await photoGalleryPage.isAlbumPlaceholderShown()).toBe(UI_META.photoGalleryPage.newAlbumPlaceholder);

        //Select the album name
        await photoGalleryPage.setAlbumName(albumName);

        //Select the apply button
        await photoGalleryPage.clickOnProceedButton();
        console.log("proceed button is clicked");
        
        
    })

    test.afterAll(async ({ browser }) => {
        await browser.close();
    });
});
