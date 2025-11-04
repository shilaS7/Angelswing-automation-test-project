export const UI_META = {
    releaseNotes: {
        header: 'Angelswing Product Updates',
        url: /.*Angelswing-Product-Updates.*/,
    },
    userGuide: {
        header: 'Angelswing User Guide',
        url: /.*Angelswing-User-Guide.*/,
    },
    officialWebsite: {
        header: 'Build with Digital Twin',
        url: /.*angelswing.io.*/,
    },
    support: {
        header: 'Angelswing User Guide',
        url: /.*Angelswing-User-Guide.*/,
    },
    projectWorkspace: {
        url: /.*project\/[^/]+\/content\/map\/.*/,
    },
    projectSettings: {
        url: /.*project\/list\/[^/]+\/information.*/,
    },
    projectList: {
        url: /.*project\/list.*/,
    },
    loginPage: {
        url: /.*login.*/,
    },
    myProjects: {
        header: 'Projects',
        url: /.*project\/list.*/
    },
    newProjectPage: {
        url: /.*project\/list\/add-project.*/,
    },
    userPage: {
        url: /.*mypage.*/,
        tabs: {
            settings: 'Settings',
            billing: 'Billing',
            security: 'Security',
        },
    },
    popupHeaders: {
        resetName: 'Reset Name',
        editPhone: 'Edit Phone Number',
        editOrganization: 'Edit Organization',
        changePurpose: 'Change Purpose',
        changeCountry: 'Change Country',
        changeLanguage: 'Change Language',
        resetPassword: 'Reset Password',
        changePlan: 'Change Plan (coming soon)',
        deleteAccount: 'Delete Account',
        changeProfileImage: 'Change Profile Image',
    },

    popupMessages: {
        changePlan: 'To change your subscription plan, please contact our customer support.',
        deleteAccount: 'To proceed with account deletion, please contact our support team.',
        passwordMismatch: "* These passwords don't match. Try again?",
        nameRequired: {
            firstName: '* First name is required',
            lastName: '* Last name is required',
        },
    },
    organizationPage: {
        header: 'Organization Settings',
        popupHeader: {
            changeOrganizationName: 'Change Organization Name',
            changeRegionCountry: 'Change Organization Region/Country',
            changeIndustry: 'Change Organization Industry',
            invitation: 'Invite Accounts',
        },
        tabs: {
            information: 'Information',
            accounts: 'Accounts',
            processing: 'Processing',
            dataStorage: 'Data Storage',
        },
        role: {
            admin: 'Org Admin',
            member: {
                projectAdmin: 'Project Admin',
                projectPilot: 'Project Pilot',
                projectMember: 'Project Member',
                projectViewer: 'Project Viewer',
            },
        },
        accountType: {
            employee: 'Employee',
            managedExternal: 'Managed External',
        },
        searchValues: [
            // Positive (exact, partial, known entries)
            'suraj',
            'suraj anand',
            'admin',
            'qa',
            'engineer',
            'angelswing',

            // Edge cases
            'Suraj',           // Capitalization
            // '  suraj  ',       // Leading/trailing whitespace
            'Admin',           // Casing
            'admin@example.com', // Email-like input
            '0',               // Numerical edge //! Issue in Pending Requests Search
            '1',
            '1000',            // Out-of-range numeric
            '',
            '57',                // Empty string
            ' ',               // Single space
            '+',               // special characters //! Issue in Pending Requests Search

            // Negative
            'xyz123unknown',
            '!!@@##',
            '🐍🔥🚀',
            'null',
            'undefined',
            '()()()',

            // Business-driven
            'organization',
            'viewer',
            'collaborator',
            'team',
            'manager',
        ],

    },
    photoGalleryPage: {
        header: 'Photo Gallery',
        headerIndoor: 'Indoor',
        tabs: {
            timeline: 'Timeline',
            location: 'Location',
            album: 'Album'
        },
        filter: {
            all: 'All',
            flightVideo: 'Flight Videos',
            birdEyeView: 'Bird Eye View Photos',
            inspectionPhoto:'Inspection Photos',
            sourcePhotos:'Source Photos',
            threeSixtyPhotos:'360 Photos',
            threeSixtySourcePhotos:'360 Source Photos',
            threeSixtyPanoramaImages:'360 Panorama Images',
            threeSixtyIndoorVideos:'360 Indoor Videos',
            threeSixtyStitchedPhotos:'Stitched Photos',
            requestedPhotos:'Requested Photos',
            threeSixtyIndoor:'360 Indoor'

        },
        locationFilters: {
            birdEyeView: 'Bird Eye View Photos',
            inspectionPhoto: 'Inspection Photos',
            sourcePhotos: 'Source Photos'
        },
        createAlbum: 'Add to Album',
        newAlbumPlaceholder: 'My New Album'
    }
};
