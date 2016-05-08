from locust import HttpLocust, TaskSet, task


class UserBehavior(TaskSet):
    def on_start(self):
        """ on_start is called when a Locust start before any task is scheduled """
        pass

    @task(1)
    def index(self):
        self.client.get("/")

    @task(1)
    def auth(self):
        self.client.get("/auth")

    @task(1)
    def deckbrowser(self):
        self.client.get("/deckbrowser")


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 1000
    max_wait = 1500
