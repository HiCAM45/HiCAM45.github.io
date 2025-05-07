let character = '';
let opponent = '';
let playerPokemon = [];
let opponentPokemon = [];
let playerPokemonIndex = 0;
let opponentPokemonIndex = 0;
let isPlayerTurn = true;

const apiBaseURL = "https://pokeapi.co/api/v2/pokemon/";

async function fetchPokemonData(pokemonName) {
    const response = await fetch(`${apiBaseURL}${pokemonName.toLowerCase()}`);
    const data = await response.json();
    
    const maxHP = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
    const attack = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
    const defense = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
    const imageUrl = data.sprites.front_default; // Get sprite image URL

    return {
        name: pokemonName,
        hp: maxHP,  // Starting HP
        maxHP: maxHP, // Store max HP for calculation
        attack: attack,
        defense: defense,
        imageUrl: imageUrl // Set the image URL here
    };
}

async function chooseCharacter(selectedCharacter) {
    character = selectedCharacter;
    opponent = character === '아르르' ? '아미티' : (character === '아미티' ? '링고' : '아르르');
    
    // Set up the player and opponent Pokémon
    playerPokemon = characters[character].pokemons;
    opponentPokemon = characters[opponent].pokemons;

    // Fetch additional Pokémon data like images and stats
    for (let i = 0; i < playerPokemon.length; i++) {
        const data = await fetchPokemonData(playerPokemon[i].name);
        playerPokemon[i] = { ...playerPokemon[i], ...data };
    }

    for (let i = 0; i < opponentPokemon.length; i++) {
        const data = await fetchPokemonData(opponentPokemon[i].name);
        opponentPokemon[i] = { ...opponentPokemon[i], ...data };
    }

    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
    
    document.getElementById('player-name').textContent = character;
    document.getElementById('opponent-name').textContent = opponent;
    
    updatePokemonLists();
    updateSkillButtons();
}

function updatePokemonLists() {
    // Update HP bars
    updateHPBar('player-hp-bar', playerPokemon[playerPokemonIndex].hp, playerPokemon[playerPokemonIndex].maxHP);
    updateHPBar('opponent-hp-bar', opponentPokemon[opponentPokemonIndex].hp, opponentPokemon[opponentPokemonIndex].maxHP);

    // Update Pokémon images in battle display
    document.getElementById('player-pokemon-img').src = playerPokemon[playerPokemonIndex].imageUrl;
    document.getElementById('opponent-pokemon-img').src = opponentPokemon[opponentPokemonIndex].imageUrl;
}

function updateHPBar(barId, currentHP, maxHP) {
    const hpPercentage = (currentHP / maxHP) * 100;
    const hpBar = document.getElementById(barId);
    
    // Check if the inner element already exists; if not, create it
    let hpInner = hpBar.querySelector('.hp-inner');
    if (!hpInner) {
        hpInner = document.createElement('div');
        hpInner.classList.add('hp-inner');
        hpBar.appendChild(hpInner);
    }
    
    // Update the width of the HP bar
    hpInner.style.width = `${hpPercentage}%`;
    updateSkillButtons();
}

function updateSkillButtons() {
    const skills = playerPokemon[playerPokemonIndex].skills;
    
    document.getElementById('skill1-btn').textContent = skills[0] || 'Skill 1';
    document.getElementById('skill2-btn').textContent = skills[1] || 'Skill 2';
    document.getElementById('skill3-btn').textContent = skills[2] || 'Skill 3';
    document.getElementById('skill4-btn').textContent = skills[3] || 'Skill 4';
}

function logBattle(message) {
    const battleLog = document.getElementById('battle-log');
    battleLog.innerHTML += `<p>${message}</p>`;
    battleLog.scrollTop = battleLog.scrollHeight;
}

function useSkill(skillNumber) {
    if (!isPlayerTurn) return;

    let player = playerPokemon[playerPokemonIndex];
    let opponent = opponentPokemon[opponentPokemonIndex];
    let damage = 0;
    let skillName = player.skills[skillNumber - 1];
    
    // Determine damage or effect based on the skill chosen
    switch (skillName) {
        case 'Thunderbolt':
        case 'Flamethrower':
            damage = Math.max(10, player.attack - opponent.defense + Math.floor(Math.random() * 10));
            break;
        case 'Quick Attack':
        case 'Tackle':
            damage = Math.max(5, player.attack - opponent.defense + Math.floor(Math.random() * 5));
            break;
        case 'Bite':
        case 'Ember':
            damage = Math.max(7, player.attack - opponent.defense + Math.floor(Math.random() * 7));
            break;
        default:
            damage = 0;
            break;
    }

    opponent.hp -= damage;
    logBattle(`${player.name} uses ${skillName} and attacks ${opponent.name} for ${damage} damage!`);

    if (opponent.hp <= 0) {
        logBattle(`${opponent.name} has fainted!`);
        opponentPokemonIndex++;
        if (opponentPokemonIndex >= opponentPokemon.length) {
            logBattle(`You win the battle!`);
            return;
        }
    }

    isPlayerTurn = false;
    setTimeout(opponentAttack, 1500);
    updatePokemonLists();
}

async function opponentAttack() {
    let opponent = opponentPokemon[opponentPokemonIndex];
    let player = playerPokemon[playerPokemonIndex];
    
    // Random opponent skill selection
    let skillNumber = Math.floor(Math.random() * opponent.skills.length);
    let skillName = opponent.skills[skillNumber];
    
    let damage = Math.max(5, opponent.attack - player.defense + Math.floor(Math.random() * 5));
    player.hp -= damage;
    logBattle(`${opponent.name} uses ${skillName} and attacks ${player.name} for ${damage} damage!`);
    
    if (player.hp <= 0) {
        logBattle(`${player.name} has fainted!`);
        playerPokemonIndex++;
        if (playerPokemonIndex >= playerPokemon.length) {
            logBattle(`You lost the battle!`);
            return;
        }
    }

    isPlayerTurn = true;
    updatePokemonLists();
}
