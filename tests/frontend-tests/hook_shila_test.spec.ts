import { test, expect } from '../../test-options';

test.describe('Hook Shila Test', () => {
   test.beforeAll(async ({ page }) => {
    console.log("before all");
   });
  
   test.afterAll(async ({ page }) => {
    console.log("after all");
   })
 
   test.beforeEach(async ({ page }) => {
    console.log("before each");
   })
   test.afterEach(async ({ page }) => {
    console.log("after each");
   })
   test('should open the page', async ({ page }) => {
    console.log("test");
   });

   test.describe('Hook Shila Test 2', () => {
    test.beforeAll(async ({ page }) => {
        console.log("before all2");
       });
      
       test.afterAll(async ({ page }) => {
        console.log("after all2");
       })
     
       test.beforeEach(async ({ page }) => {
        console.log("before each2");
       })
       test.afterEach(async ({ page }) => {
        console.log("after each2");
       })
       test('should open the page', async ({ page }) => {
        console.log("test2");
       });
   });  
});