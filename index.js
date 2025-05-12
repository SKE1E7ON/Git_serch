function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const input_serch = document.getElementById('input_serch');
const git_list_result = document.getElementById('serch_list');
const git_list_resuls = document.getElementById('git_list_result');

const arr = []
async function searchGit(value) {
    const trimmedValue = value.trim();
    if (trimmedValue === "") return;

    git_list_result.innerHTML = "Поиск...";

    const encodedQuery = encodeURIComponent(trimmedValue);

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q= ${encodedQuery}&per_page=5`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!response.ok) {
            if (response.status === 429) {
                git_list_result.innerHTML = "Слишком много запросов. Подождите немного.";
                return;
            }
            throw new Error(`Ошибка сети: ${response.status} (${response.statusText})`);
        }

        const result = await response.json();
        console.log(result)

        git_list_result.innerHTML = "";
        result.items.forEach(repo => {

            const repositories = document.createElement("div");
            repositories.className = 'repositories'

            const title = document.createElement("h3")
            title.textContent = repo.full_name;

            const button_add = document.createElement('button')
            button_add.type = "button";
            button_add.textContent = "Добавить"

            const result_repo = {
                name: repo.name,
                owner: repo.owner.login,
                stars: repo.stargazers_count,
            }

            button_add.addEventListener('click', (event)=>{
                event.preventDefault();
            
                const isExists = arr.some(r => 
                    r.name === result_repo.name && r.owner === result_repo.owner
                );
            
                if (!isExists) {
                    arr.push(result_repo);
                    
                    git_list_resuls.innerHTML = "";
                    arr.forEach(repo => {
                        const div = document.createElement("li");
                        const button_remove = document.createElement("button")
                        button_remove.textContent = "удалить"
                        button_remove.addEventListener('click', () => {
                            const idx = arr.findIndex(r => 
                                r.name === repo.name && r.owner === repo.owner
                            );
                            if (idx !== -1) {
                                arr.splice(idx, 1);
                                git_list_resuls.removeChild(div);
                                git_list_resuls.removeChild(button_remove);
                            }
                        });

                        div.textContent = `${repo.owner}/${repo.name} ⭐ ${repo.stars}`;
                        git_list_resuls.appendChild(div);
                        div.appendChild(button_remove)
                    });
                }
            });



            repositories.appendChild(title)
            repositories.appendChild(button_add)
            git_list_result.appendChild(repositories);
        });

    } catch (error) {
        git_list_result.innerHTML = "Ошибка загрузки данных";
        console.error(error);
    }
}
input_serch.addEventListener('input', debounce((e) => {
    const value = e.target.value;
    if (!value.trim()) {
        git_list_result.innerHTML = "^_^";
    } else {
        searchGit(value);
    }
}, 300));