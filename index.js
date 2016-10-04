const got = require('got');
const moment = require('moment');

function queryNpms(query) {
    const enc = encodeURIComponent(query);
    const url = `https://api.npms.io/v2/search?q=${enc}`;

    return new Promise((resolve, reject) => {
        got(url)
            .then(res => {
                const body = JSON.parse(res.body);
                const result = body.results.map(pkg => {
                    // console.log(pkg);
                    const updated = moment(pkg.package.date).fromNow();

                    return {
                        id: pkg.package.name,
                        payload: 'open-npm',
                        title: `<b>${pkg.package.name}</b> (<em>${pkg.package.version}</em>) - <span style="font-size: 0.8em">Last updated <em>${updated}</em></span>`,
                        desc: pkg.package.description
                    }; 
                });

                resolve(result);
            })
            .catch(err => reject(err));
    });
}

module.exports = (context) => {
    const shell = context.shell;

    function search(query, res) {
        const query_trim = query.trim();

        if (query_trim.length === 0) {
            return res.add({
                id: '',
                payload: 'open-npms',
                title: 'Search on npms',
                desc: 'Search on npms.io'
            });
        }

        queryNpms(query_trim)
            .then(results => res.add(results));
    }

    function execute(id, payload) {
        if (payload !== 'open-npm' && payload !== 'open-npms') {
            return;
        }

        switch(payload) {
            case 'open-npm':
                shell.openExternal(`https://www.npmjs.com/package/${id}`);
                return;
            case 'open-npms':
            default:
                shell.openExternal(`https://npms.io/search?q=${id}`);
                return;
        }
    }

    return {
        search,
        execute
    };
}

queryNpms('steiner');