export const VIEWS = {
    overview: {
        name: "Data Overview",
        breadcrumbs: 'Data Overview',
        menu: 'Overview Data',
        icon: 'map',
        path: 'overview'
    },
    user: {
        name: "Participants Economic Profile",
        breadcrumbs: 'Participants Economy',
        menu: 'Citizen Data',
        icon: 'user',
        path: 'user'
    },
    city: {
        name: "Businesses Economic Profile",
        breadcrumbs: 'City Economy',
        menu: 'Businesses Data',
        icon: 'city',
        path: 'city'
    }
}

export const buildingsColors = {
    commercial: {color:'#E1DA83'},
    school: {color:'#CF7856'},
    residental:{color:'#B4D8C7'}
}

export const PORT = 3000;
export const API_URL = `http://localhost:${PORT}/api`;
