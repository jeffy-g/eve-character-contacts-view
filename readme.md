[![LICENSE](https://img.shields.io/badge/Lisence-AGPLv3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0.en.html)

# [EVE online] Character Contacts view

Display ESI endpoint [`/characters/{character_id}/contacts/`](https://esi.evetech.net/ui/#/Contacts/get_characters_character_id_contacts)

sample site: https://eve-character-contacts.netlify.app/

> ## Getting Started

Developed on [codesandbox](https://codesandbox.io/s/eve-character-contacts-view-v0sgf)

> ## details

-   EVE SSO Authentication with implicit flow, which fire ESI request with an access token with an expiration of 20 minutes.

-   developmented core components for display with minimal dependencies.
    -   core components: `src/components/contacts/\*.tsx`
        -   `react@latest` `@material-ui/core@4.x`
        *   by adding the above packages, **it can be reused by other react applications**.

> ## ♻️ development in local

If you want to clone to local and execute or edit

```sh
git clone https://github.com/jeffy-g/eve-character-contacts-view.git
cd ./eve-character-contacts-view
yarn install
yarn start
```

> ## Authors

-   **jeffy-g** - [jeffy-g](https://github.com/jeffy-g)

> ## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

> ## CCP Copyright Notice

EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide.

All other trademarks are the property of their respective owners.  
EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork,  
screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property  
relating to these trademarks are likewise the intellectual property of CCP hf.

CCP hf. has granted permission to `eve-character-contacts-view` to use EVE Online and all associated logos  
and designs for promotional and information purposes on its website but does not endorse,  
and is not in any way affiliated with, `eve-character-contacts-view`.

CCP is in no way responsible for the content on or functioning of this website,  
nor can it be liable for any damage arising from the use of this website.
