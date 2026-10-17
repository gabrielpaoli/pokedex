# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Pokemon details

The header language selector switches the entire interface between Spanish and
English, including navigation, search filters, type labels and Pokemon details.
The initial language follows the browser preference; the selection is saved locally.
The header uses a Spanish/English segmented control and highlights the current route.
Type badges share icons, colors and styling across detail pages, search results and
search filters. Filter badges are toggle buttons with a selected outline.
The search Show more button adds the quantity currently selected in the form
and is hidden when no additional matching Pokemon remain.
API descriptions use the selected language and show an explicit unavailable message
when PokeAPI has no translation, rather than mixing languages.

Open `/pokedex/:id` using a Pokemon ID or name to view its artwork, types,
localized species description, physical data,
abilities, base stats and EV yields, sprites, varieties, moves and game appearances.
Move descriptions and effects, power, accuracy, PP, type and damage category load
when the moves section is opened, 12 moves at a time with a Show more button.
Ability names and descriptions also follow the selected language when available.
Moves use type and damage-category icons rather than attack artwork (not supplied
by PokeAPI). Game appearances are edition cards with decorative cartridge art and
the Pokemon's version-specific sprite from the API's `sprites.versions`, when
available. These are not official game covers; unavailable or failed sprite images
are explicitly labeled and replaced by a controller icon.
The evolution tree runs left to right with arrows and retains alternative branches.
It includes API-provided evolution conditions (without game edition labels) and scrolls horizontally on small screens;
each evolution and variety links to its own detail page. Species without a matching
Pokemon name use their default variety for evolution links and artwork.
Data is fetched from PokéAPI and requires an internet connection. Loading, missing
Pokemon and request errors are shown on the page with a retry option for errors.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
