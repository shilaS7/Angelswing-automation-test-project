export const purpose = ['Construction', 'Survey', 'Urban Planning', 'Disaster Response', 'Inspection', 'Drone Service', 'Others'];
export const countries = ['Afghanistan', 'Åland Islands', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia, Plurinational State of', 'Bonaire, Sint Eustatius and Saba', 'Bosnia and Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Congo, The Democratic Republic of the', 'Cook Islands', 'Costa Rica', `Côte d'Ivoire`, 'Croatia', 'Cuba', 'Curaçao', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands(Malvinas)', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'French Southern Territories', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guernsey', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Heard Island and McDonald Islands', 'Holy See (Vatican City State)', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran, Islamic Republic of', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', `Korea, Democratic People's Republic of`, 'Korea, Republic of', 'Kuwait', 'Kyrgyzstan', `Lao People's Democratic Republic`, 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Macedonia, Republic of', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia, Federated States of', 'Moldova, Republic of', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine, State of', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Réunion', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Barthélemy', 'Saint Helena, Ascension and Tristan da Cunha', 'Saint Kitts and Nevis', 'Saint Lucia', , 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten(Dutch part)', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Georgia and the South Sandwich Islands', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'South Sudan', 'Svalbard and Jan Mayen', 'Swaziland', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Taiwan', 'Tajikistan', 'Tanzania, United Republic of', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'United States Minor Outlying Islands', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela, Bolivarian Republic of', 'Viet Nam', 'Virgin Islands, British', 'Virgin Islands, U.S.', 'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'];


// SQL Injection Payloads
export const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "'; DELETE FROM users WHERE 1=1; --",
    "1' OR '1' = '1' --",
    "' OR 'a'='a",
    "' OR 1=1 --",
    "' OR '1'='1' /*",
    "'; EXEC xp_cmdshell('dir'); --",
    "'; SELECT * FROM users; --",
];


export const invalidEmails = [
    // 🚨 Missing "@" symbol
    'plainaddress',
    'username.domain.com',
    'username@domaincom',

    // 🚨 Missing domain
    'username@.com',
    'username@domain.',
    'username@.domain.com',

    // 🚨 Consecutive dots (not allowed in local part or domain part)
    'username..email@domain.com',
    'username@domain..com',

    // 🚨 Invalid characters in local part
    'user name@domain.com', // Spaces not allowed
    'user@domain com', // Space in domain
    'user@domain,com', // Comma instead of dot
    'user@domain#com', // Special character in domain
    'user@domain$%.com', // Special characters not allowed
    'user@"domain".com', // Quotes in domain not allowed

    // 🚨 Missing username
    '@domain.com',
    'user@.com',
    'user@domain..com', // Double dots

    // 🚨 TLD Issues
    'username@domain.c', // Too short TLD
    'username@domain.123', // Numeric TLD not common
    'username@domain..123', // Double dot + numeric TLD

    // 🚨 Quoted Strings (valid in theory but rarely supported)
    '"username"@domain.com',
    'user@domain."com"',
    'user@do"main.com',

    // 🚨 IP Address Domains (valid per RFC but rarely supported)
    'username@[192.168.1.1]', // Allowed in RFC but not commonly accepted

    // 🚨 Other edge cases
    'username@domain.com (comment)', // Parentheses not allowed
    'username@[IPv6:2001:db8::1]', // IPv6 email (valid RFC, but rare in practice)
    '" "@domain.com', // Space-only local part

    // 🚨 Invalid characters in domain
    'user@-domain.com', // Domain cannot start with a hyphen
    'user@domain_.com', // Underscore not allowed in domain
    'user@domain-.com', // Domain cannot end with a hyphen

];

export const invalidPasswords = [
    // 🚨 Too Short (Less than 6 characters)
    { password: '123', expectedMessage: '* Try one with at least 6 characters.' },
    { password: 'abc', expectedMessage: '* Try one with at least 6 characters.' },
    { password: 'A1@', expectedMessage: '* Try one with at least 6 characters.' },
    { password: 'p@ss', expectedMessage: '* Try one with at least 6 characters.' },

    // 🚨 Too Long (More than 22 characters)
    { password: 'A'.repeat(23), expectedMessage: '* Password should be less than 22 characters.' },
    { password: 'P@ssword123456789012345', expectedMessage: '* Password should be less than 22 characters.' },

    // 🚨 Missing Uppercase Letter
    { password: 'password123!', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'test@123', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'abcde@#$', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },

    // 🚨 Missing Numbers
    { password: 'Password!', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'Test@abcd', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },

    //! Display message * Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_). which does not align with the input.
    // 🚨 Contains Spaces
    { password: 'Pass word123!', expectedMessage: '* Password can only include capital letters, small letters, numbers, and simple symbols(!@$%^&*+-_).' },
    { password: 'Hello World@1', expectedMessage: '* Password can only include capital letters, small letters, numbers, and simple symbols(!@$%^&*+-_).' },

    // 🚨 Commonly Used Weak Passwords
    { password: 'password', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: '123456', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'qwerty', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'letmein', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },

    // 🚨 Combination Errors (Multiple issues in one password)
    { password: 'pass', expectedMessage: '* Try one with at least 6 characters.' },
    { password: 'P@ss', expectedMessage: '* Try one with at least 6 characters.' },
    { password: 'testtest', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },

    // 🚨 Contains **invalid special characters** issue in this two
    { password: 'P@ssword#', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'Test<>?', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },

    //! Bug as Password123 becomes valid but as per Govinda message to designer, one special character is must. but in ui then is no such message for special character
    // 🚨 Missing Special Character
    { password: 'Password123', expectedMessage: "* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_)." },
    { password: 'TESTPASSWORD1', expectedMessage: "* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_)." },


    // ! Bug as Next button is displayed but in the info message lowercase is must
    // 🚨 Missing Lowercase Letter 
    { password: 'PASSWORD123!', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },
    { password: 'TEST@123', expectedMessage: '* Password should include capital letters, small letters, numbers and special symbols(!@$%^&*+-_).' },



];

export const mismatchedPasswords = [
    { password: 'Test@1234', confirmPassword: 'Test@5678', expectedMessage: `* These passwords don't match. Try again?` },
    { password: 'SecurePass1!', confirmPassword: 'SecurePass2!', expectedMessage: `* These passwords don't match. Try again?` },
    { password: 'Abc!@123', confirmPassword: 'Abc!@124', expectedMessage: `* These passwords don't match. Try again?` },
    { password: 'CorrectPass$', confirmPassword: 'WrongPass$', expectedMessage: `* These passwords don't match. Try again?` },
    { password: 'P@sswordOne', confirmPassword: 'P@sswordTwo', expectedMessage: `* These passwords don't match. Try again?` }
];


export const invalidPhoneNumbers = [
    { phoneNumber: '123ABC', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: 'phone123', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '++12345', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '123-456-78@', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '123 456 7890$', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '#1234567890', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '123!@#456', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '1234_567', expectedMessage: '* Invalid contact number.' },
    { phoneNumber: '12 34 56 78', expectedMessage: '* Invalid contact number.' }
];
