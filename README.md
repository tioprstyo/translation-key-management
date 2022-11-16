# translation-key-management
Sync your key store of lang at google sheet to your project

example config 

args = {
    isMultipleSheet: false, // default is false
    sheetURL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTIwFYMwk9dRXKlHyQKE0YucxQf9thTaSJuqAqp8twbNqx8qnXnMO-4gy8Wwkhf1g', // default is empty string if not multiple sheets
    gid: { // default is null if data is multiple sheets
        mainSheets: 1565530431,
        sheets: {
            page: 'home',
            gid: 1433544039
        }
    },
}
