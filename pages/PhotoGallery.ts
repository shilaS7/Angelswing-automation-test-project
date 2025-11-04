import { Page, expect } from '@playwright/test';
import { HelperBase } from './HelperBase';
import { BasePage } from './BasePage';

export class PhotoGallery extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async getHeaderText() {
        await this.page.getByTestId('photo-gallery').waitFor({ state: 'visible' });
        return await this.page.getByTestId('photo-gallery').textContent();
    }
    // click on Timeline tab
    async clickOnTimelineTab() {
        await this.page.getByTestId('photo-album-tab-timeline').waitFor({ state: 'visible' });
        await this.page.getByTestId('photo-album-tab-timeline').filter({ hasText: 'Timeline' }).click();
    }
    //Click on Location tab
    async clickOnLocationTab() {
        await this.page.getByTestId('photo-album-tab-location').filter({ hasText: 'Location' }).click();
    }
    //Click on Album tab
    async clickOnAlbumTab() {
        await this.page.getByTestId('photo-album-tab-album').filter({ hasText: 'Album' }).click();
    }
    
    async isTimelineTabShownAsSelected() {
        return await this.isTabShownAsSelected('photo-album-tab-timeline');
    }
    async isLocationTabShownAsSelected() {
        return await this.isTabShownAsSelected('photo-album-tab-location');
    }
    async isAlbumTabShownAsSelected(){
        return await this.isTabShownAsSelected('photo-album-tab-album');
    }

    private async isTabShownAsSelected(tabName: string) {
        const isSelected = await this.page.getByTestId(`${tabName}`).getAttribute('data-selected');
        return isSelected === 'true';
    }

    async clickFilterAll() {
        await this.page.locator('[data-testid="photo-collection-filter-icon-inactive"]').click();
    }
    async clickAllOption(){
        await this.page.getByTestId('photo-collection-filter-item-all').click();
    }
    async isAllFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-all');
    }
    async clickFilterFlightVideo(){
        return await this.page.getByTestId('photo-collection-filter-item-overlay').click();
    }
    async getFilterText(){
        return await this.page.getByTestId('photo-collection-filter-item-overlay').textContent();
    }

    async clickFilterBirdeye(){
        return await this.page.getByTestId('photo-collection-filter-item-bird_eye_view_timeline').click();
        
    }
    async getFilterTextBirdeye(){
        return await this.page.getByTestId('photo-collection-filter-item-bird_eye_view_timeline').textContent();
    }

    async isBirdeyeFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-bird_eye_view_timeline');
    }

    async clickFilterInspection(){
        return await this.page.getByTestId('photo-collection-filter-item-drone').click();
    }    
    async getFilterTextInspection(){
        return await this.page.getByTestId('photo-collection-filter-item-drone').textContent();
    }
    async isInspectionFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-drone');
    }

    async clickFilterSourcePhoto(){
        return await this.page.getByTestId('photo-collection-filter-item-source').click();
    }
    async getFilterTextSourcePhoto(){
        return await this.page.getByTestId('photo-collection-filter-item-source').textContent();
    }
    async isSourcePhotoFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-source');
    }

    // async clickFilter360Photos(){
    //     return await this.page.getByTestId('photo-collection-filter-item-three_sixty_source').click();
    // }
    // async is360PhotosFilterShownAsSelected() {
    //     return await this.isTabShownAsSelected('photo-collection-filter-item-three_sixty');
    // }

    async clickfilter360SourcePhoto(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_source').click();
    }
    async getFilterText360SourcePhoto(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_source').textContent();
    }
    async is360SourcePhotoFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-three_sixty_source');
    }
 
    async clickFilter360StitchedPhotos(){
        return await this.page.getByTestId('photo-collection-filter-item-stitched').click();
    }
    async getFilterText360StitchedPhotos(){
        return await this.page.getByTestId('photo-collection-filter-item-stitched').textContent();
    }
    async is360StitchedPhotosFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-stitched');
    }

     async clickFilter360Video() {
        await this.page.getByTestId('photo-collection-filter-item-three_sixty_video').click();
     }
     async getFilterText360Video(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_video').textContent();
    }
     async is360VideoFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-three_sixty_video');
     }

     async clickfilterRequestedPhotos(){
        return await this.page.getByTestId('photo-collection-filter-item-viewpoint').click();
     }
     async getFilterTextRequestedPhotos(){
        return await this.page.getByTestId('photo-collection-filter-item-viewpoint').textContent();
    }
     async isRequestedPhotosFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-viewpoint');
     }
     
     async clickFilter360PanoramaImages(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_panorama_timeline').click();
     }
     async getFilterText360PanoramaImages(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_panorama_timeline').textContent();
    }
     async is360PanoramaImagesFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-three_sixty_panorama_timeline');
     }

     async clickFilter360Indoor(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_vslam_timeline').click();
     }
     async getFilterText360Indoor(){
        return await this.page.getByTestId('photo-collection-filter-item-three_sixty_vslam_timeline').textContent();
    }
     async is360IndoorFilterShownAsSelected() {
        return await this.isTabShownAsSelected('photo-collection-filter-item-three_sixty_vslam_timeline');
     }

     async clickFilterLocation(){
        return await this.page.locator('data-testid="photo-album-tab-location"').click();
     }
     async clickFilterIcon(){
        await this.page.getByTestId('timelapse-collection-filter-icon-inactive').waitFor({ state: 'visible' });
        await this.page.getByTestId('timelapse-collection-filter-icon-inactive').click();
        // Wait for the dropdown to be visible
        await this.page.getByTestId('timelapse-collection-filter-item-source').waitFor({ state: 'visible' });
    }
     async clickFilterLocationSource(){
        await this.page.getByTestId('timelapse-collection-filter-item-source').waitFor({ state: 'visible' });
        return await this.page.getByTestId('timelapse-collection-filter-item-source').click();
     }

     async clickFilterLocationInspection(){
        return await this.page.getByTestId('timelapse-collection-filter-item-drone').click();
    }

    async getFilterTextLocationBirdeye(){
        return await this.page.getByTestId('timelapse-collection-filter-item-integration').textContent();
    }
    // async getFilterTextLocationFilterSource(){
    //         return await this.page.getByTestId('timelapse-collection-filter-item-source').textContent();
    // }
    async getFilterTextLocationFilterSource(){
        return await this.page.locator('[data-testid="timelapse-collection-filter-icon-inactive"] +div').textContent();
}

    async getFilterTextLocationFilterInspection(){
        // Wait for the element to be visible before getting text content
        
        return await this.page.locator('[data-testid="timelapse-collection-filter-icon-inactive"] +div').textContent();
    }

  //album Tab
  async clickFilterIconAlbum(){
    return await this.page.getByTestId('photo-album-collection-filter-icon-inactive').click();
  }
    async clickAlbumFilter(){
        return await this.page.locator('data-testid="photo-album-tab-location"').click();
    }
    // async isAlbumFilterShownAsSelected(){
    //     return await this.isTabShownAsSelected('photo-album-collection-filter-item-all');
    // }
    async clickAllbutton(){
        return await this.page.locator('data-testid="photo-album-collection-filter-item-all"').click();
    }
    async clickAllOptionAlbum(){
        return await this.page.getByTestId('photo-album-collection-filter-item-all').click();
    }
    async isAllOptionAlbumShownAsSelected(){
        return await this.isTabShownAsSelected('photo-album-collection-filter-item-all');
    }
    async clickFilterAlbumBirdeye(){
        return await this.page.getByTestId('photo-album-collection-filter-item-bird_eye').click();
    }
    async getFilterTextAlbumBirdeye(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-bird_eye"]').textContent();
    }
    async getFilterTextAlbumInspection(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-inspection"]').textContent();
    }
    async getFilterTextAlbumSourcePhoto(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-source"]').textContent();
    }
    async getFilterTextAlbum360SourcePhoto(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-three_sixty_source"]').textContent();
    }
    async getFilterTextAlbumRequestedPhotos(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-viewpoint"]').textContent();
    }
    async getFilterText360StitchedPhotosAlbum(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-stitched"]').textContent();
    }
    async getFilterText360PanoramaImagesAlbum(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-three_sixty_panorama_album"]').textContent();
    }
    async getFilterText360IndoorAlbum(){
        return await this.page.locator('[data-testid="photo-album-collection-filter-item-three_sixty_vslam_album"]').textContent();
    }

    async clickFilterAlbumInspection(){
        return await this.page.getByTestId('photo-album-collection-filter-item-inspection').click();
    }
    async clickFilterAlbumSourcePhoto(){
        return await this.page.getByTestId('photo-album-collection-filter-item-source').click();
    }
    async clickFilterAlbum360Photos(){
        return await this.page.getByTestId('photo-album-collection-filter-item-three_sixty').click();
    }
    async clickFilterAlbum360SourcePhoto(){
        return await this.page.getByTestId('photo-album-collection-filter-item-three_sixty_source').click();
    }
    async clickFilterAlbum360StitchedPhotos(){
        return await this.page.getByTestId('photo-album-collection-filter-item-stitched').click();
    }
    async clickFilterAlbum360PanoramaImages(){
        return await this.page.getByTestId('photo-album-collection-filter-item-three_sixty_panorama_album').click();
    }
    async clickFilterAlbum360Indoor(){
        return await this.page.getByTestId('photo-album-collection-filter-item-three_sixty_vslam_album').click();
    }
    async clickFilterAlbumRequestedPhotos(){
        return await this.page.getByTestId('photo-album-collection-filter-item-viewpoint').click();
    }
    

    async clickOnPhoto(){
        return await this.page.locator('[data-testid="photo-album-item-185002"]>div').first().click();
    }

    async clickOnPhotoVideo(){
        return await this.page.locator('[data-testid="photo-album-item-306"]').dblclick();
    }

    async clickOnPhotoInspection(){
        return await this.page.locator('[data-testid="photo-album-item-185005"]').first().click();
    }
    async clickOnPhotoSource(){
        return await this.page.locator('[data-testid="photo-album-item-175985"]').first().click();
    }
    async clickOnPhotoVslam(){
        return await this.page.locator('[data-testid="photo-list-root-component"]').first().click();
    }
    // async isPhotoSelected(){
    //     return await this.page.locator('[data-testid="photo-album-tabs"] +div+div>div>div').first().getAttribute('data-selected');
    // }  
    async  uploadPhotoFromGallery(){
        return await this.page.getByTestId('photo-upoload-button').click();
    }
     async clickonUploadButtonFileChooser(){
        return await this.page.locator('[data-testid="popup"]>div>div>div>div>label').click();
     }
     async clickonUploadButtonPopup(){
        return await this.page.getByTestId('upload-popup-confirm-button').click();
     }
     async isCloseButtonShown(){
        return await this.page.locator('[data-testid="popup"] > div>div>div>button').click();
     }
     async isPhotoSelected(){
        return await this.page.locator('[data-testid="selected-text-element"]').textContent();
     }

     async getSelectedItemsCount(){
        const selectedText = await this.isPhotoSelected();
        if (!selectedText) return 0;
        
        // Extract number from text like "1 item selected" or "3 items selected"
        const match = selectedText.match(/(\d+)\s+items?\s+selected/);
        return match ? parseInt(match[1], 10) : 0;
     }

     async isAnyPhotoSelected(){
        const selectedText = await this.isPhotoSelected();
        return selectedText !== null && selectedText.includes('selected');
     }

     async uploadSuccessMessage(){
        return await this.page.locator('[data-testid="popup"]>div>div>p').textContent();
     }

     async clickPhotoInspectionAlbum(){
        return await this.page.locator('[data-testid="photo-album-185005"]').click();
        // return await this.page.locator('[data-testid^="photo-album-"]').first().click();
     }
    
     async clickPhotoSourceAlbum(){
        return await this.page.locator('[data-testid="photos-root-component"]').first().click();
     }

     async clickPhoto360SourceAlbum(){
        return await this.page.locator('[data-testid="photo-album-175949"]').click();
     }

     async clickPhoto360Source(){
        return await this.page.locator('[data-testid="photo-album-item-175949"]').first().click();
     }

     async clickPhoto360PanoramaImagesAlbum(){
        return await this.page.locator('[data-testid="photo-album-175947"]').click();
     }

     async clickPhoto360IndoorAlbum(){
        return await this.page.locator('[data-testid="photo-album-223"]').click();
     }

     async clickPhoto360Indoor(){
        return await this.page.locator('[data-testid="vslam-photo-inspection-list-item-360-223"]>div+div+div>button').click();
     }
    

    //  async clickPhoto360Indoor(){
    //     return await this.page.locator('[data-testid="photos-root-component"]>div>button').first().click();
    //  }

     async slidetoggleIndoor(){
        return await this.page.locator('[data-testid="sidebar-toggle-button"]').click();
     }

     async getHeaderTextIndoor() {
        return await this.page.getByTestId('indoor-floors-list-title').textContent();
    }


     async clickPhotoAlbum(){
        return await this.page.locator('[data-testid="photo-album-tabs"] +div+div>div>div>div').click();
     }

     async clickAddToAlbumButton(){
        return await this.page.getByTestId('photo-album-selection-bar-add-to-album-button').click();
     }

     async isAddToAlbumButtonShown(){
        return await this.page.getByTestId('popup-title').isVisible();
     }

     async clickCreateAlbumButton(){
        return await this.page.getByTestId('add-to-new-album-option').click();
     }
    async isAlbumPlaceholderClicked(){
        return await this.page.getByTestId('add-to-new-album-name-input').isVisible();
        
    }
    async isAlbumPlaceholderShown(){
        return await this.page.getByTestId('add-to-new-album-name-input').inputValue();
    }

    async setAlbumName(albumName: string){
        await this.page.getByTestId('add-to-new-album-name-input').fill(albumName);
    }
    async clickOnProceedButton(){
        return await this.page.getByTestId('add-to-album-proceed-button').click();
    }
}