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
		},
		fields:['title','summary','origin','date','item'],
		typos:[{'val':'actualités'},{'val':'position'},{'val':'outils'},{'val':'fondamentaux'}],
		portails:[
			{
				'val':'Economie', 'sous_portail':[{'val':'eco_one'}, {'val':'eco_two'}, {'val':'eco_three'}]
			},
			{
				'val':'Syndical', 'sous_portail':[{'val':'synd_one'}, {'val':'synd_two'}, {'val':'synd_three'}]
			}
		]
	}
);