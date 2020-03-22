const moment = require('moment');

function csbsAdapter(raw, next) {
    try {
        const geoId = +`${raw['STATEFP']}${raw['COUNTYFP']}`;
        let dead = 0;
        let newDead = 0;
        if (raw['Death'].includes("+")) {
            [dead, newDead] = raw['Death'] = raw['Death'];
        } else {
            dead = raw['Death']
        }
        return next(null, {
            geoId
            , confirmed: raw['Confirmed']
            , newConfirmed: raw['New']
            , dead
            , newDead
            , fatality: raw['Fatality Rate'].replace("%", "")
            , Latitude: raw['Latitude']
            , Longitude: raw['Longitude']
            , lastFileUpdate: raw['Last Update']
            , entry_date: moment(raw['Last Update'].slice(0, 10)).format('YYYY-MM-DD')
            , population: 0 // Data is not accurate
            , dataSRC: "csbsAdapter"
        });
    } catch (err) {
        return next(err);
    }
}

function csbsFipsAdapter(raw, next) {
    const geoId = +`${raw['STATEFP']}${raw['COUNTYFP']}`;
    const county = raw['County Name'];
    const state = raw['State Name'];
    const stateFP = raw['STATEFP'];
    const countyFP = raw['COUNTYFP'];
    return next(null, {
        geoId
        , county
        , state
        , stateFP
        , countyFP
        , dataSRC: "csbsAdapter"
    });
}
module.exports = {
    csbsAdapter
    , csbsFipsAdapter
}