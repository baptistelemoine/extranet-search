'use strict';

app.services.value('ConfigManager', {
		searchUrl:'/search',
		suggestUrl:'/suggest',
		getItemName:function(item){
			switch(item){
				case 'structures_territoires':
					return 'Structures et territoires';
				case 'communication':
					return 'Communication';
				case 'syndical':
					return 'Syndical';
				case 'eco_dev_dur':
					return 'Economie et développement durable';
				case 'reglementation':
					return 'Affaires sociales';
				case 'juridique_fiscal':
					return 'Juridique et fiscal';
				case 'administratif':
					return 'Administratif';
				case 'formation':
					return 'Formation';
				case 'informatique':
					return 'Informatique';
				case 'commissions_sections':
					return 'Commissions et sections';
				case 'pol_gen':
					return 'Agriculture et politique';
				case 'offres_emploi':
					return "Offres d'emploi";
			}
		}
	}
);